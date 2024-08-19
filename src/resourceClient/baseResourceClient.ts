import axios, {
  AxiosError,
  AxiosInstance,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Method
} from 'axios';
import * as https from 'https';
import axiosBetterStacktrace from 'axios-better-stacktrace';
import { ClientConfiguration } from '../interfaces/Config';
import ApiUrlBuilder from './apiUrlBuilder/apiUrlBuilder';
import { ClientRequest, IncomingMessage } from 'http';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  RatelimitError,
  RequestRetriesExceededError,
  UnauthorizedError
} from '../errors';
import { sleep } from '../util/sleep';
import { parseWithDates } from '../util/json';

export class BaseResourceClient {
  protected client: AxiosInstance;
  baseURL: string;

  constructor(
    // eslint-disable-next-line no-unused-vars
    public urlBuilder: ApiUrlBuilder,
    public config: ClientConfiguration
  ) {
    this.baseURL = config.http?.baseURL ?? 'https://api.music.apple.com';
    this.client = this.create({ resInterceptor: true });
  }

  // create axios client, set interceptors, handle errors & auth
  private create(options: { resInterceptor?: boolean }): AxiosInstance {
    const config: AxiosRequestConfig = {
      baseURL: this.baseURL,
      proxy: this.config.http?.proxy,
      // https://github.com/axios/axios/blob/v0.20.0-0/lib/defaults.js#L57-L65
      transformResponse: [
        (data): unknown => {
          /*eslint no-param-reassign:0*/
          if (typeof data === 'string') {
            try {
              data = parseWithDates(data);
            } catch (e) {
              /* Ignore */
            }
          }

          return data;
        }
      ],
      validateStatus: () => true // Handle errors by ourselves
    };

    if (this.config.http?.localAddress) {
      config.transport = {
        ...https,
        request: (
          options: https.RequestOptions,
          // eslint-disable-next-line no-unused-vars
          callback: (res: IncomingMessage) => void
        ): ClientRequest =>
          https.request(
            {
              ...options,
              localAddress: this.config.http!.localAddress,
              family: this.config.http!.localAddress?.includes(':') ? 6 : 4
            },
            callback
          )
      };
    }

    const client = axios.create(config);
    axiosBetterStacktrace(client);

    client.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${this.config.developerToken}`;
      config.headers['Media-User-Token'] = this.config.mediaUserToken ?? '';
      config.headers.Origin = 'https://music.apple.com';
      config.headers['User-Agent'] =
        this.config.http?.userAgent ??
        '@statsfm/applemusic.js (https://github.com/statsfm/applemusic.js)';
      config.headers = Object.assign(this.config.http?.headers ?? {}, config.headers);

      return config;
    });

    if (options.resInterceptor || options.resInterceptor === undefined) {
      client.interceptors.response.use((config) => config, this.errorHandler.bind(this));
    }

    return client;
  }

  private async errorHandler(err: AxiosError<Record<string, unknown>>): Promise<AxiosResponse> {
    if (!axios.isAxiosError(err) || !err.response) {
      throw err;
    }

    const { response } = err;

    const { status: statusCode } = response;

    switch (statusCode) {
      case 400:
        throw new BadRequestError(err.config.url, {
          stack: err.stack,
          data: response.data
        });

      case 401:
        throw new UnauthorizedError(err.config.url, {
          stack: err.stack,
          data: response.data
        });

      case 403:
        throw new ForbiddenError(err.config.url, {
          stack: err.stack,
          data: response.data
        });

      case 404:
        throw new NotFoundError(err.config.url, err.stack);

      case 429:
        await this.handleRateLimit(response, err);
        break;

      default:
        if (statusCode >= 500 && statusCode < 600) {
          return await this.handle5xxErrors(response, err, statusCode);
        } else {
          throw err;
        }
    }
  }

  private async handleRateLimit(res: AxiosResponse, err: AxiosError): Promise<AxiosResponse> {
    if (this.config.logRetry) {
      // eslint-disable-next-line no-console
      console.log(res);
    }

    if (this.config.retry || this.config.retry === undefined) {
      const retryAfter = parseInt(res.headers['retry-after']) || 0;

      if (this.config.logRetry || this.config.logRetry === undefined) {
        // eslint-disable-next-line no-console
        console.error(
          `Hit ratelimit, retrying in ${retryAfter} second(s), path: ${err.request.path}`
        );
      }

      await sleep(retryAfter * 1_000);
      return await this.client.request(err.config);
    } else {
      throw new RatelimitError(
        `Hit ratelimit, retry after ${res.headers['retry-after']} seconds`,
        err.config.url,
        {
          stack: err.stack,
          data: res.data
        }
      );
    }
  }

  private async handle5xxErrors(
    res: AxiosResponse,
    err: AxiosError,
    statusCode: number
  ): Promise<AxiosResponse> {
    if (!this.config.retry5xx && this.config.retry5xx !== undefined) {
      throw err;
    }

    this.config.retry5xxAmount = this.config.retry5xxAmount || 3;
    const nClient = this.create({ resInterceptor: false });

    for (let i = 1; i <= this.config.retry5xxAmount; i++) {
      if (this.config.debug) {
        // eslint-disable-next-line no-console
        console.log(`(${i}/${this.config.retry5xxAmount}) retry ${err.config.url} - ${statusCode}`);
      }

      await sleep(1_000);

      try {
        const nRes = await nClient.request(err.config);

        if (nRes.status >= 200 && nRes.status < 300) {
          return nRes;
        }
        statusCode = nRes.status;
      } catch (error) {
        if (!axios.isAxiosError(error) || !error.response) {
          throw error;
        }

        statusCode = error.response.status;
        switch (statusCode) {
          case 429:
            await this.handleRateLimit(error.response, error);
            break;

          case 401:
            throw new UnauthorizedError(error.config.url, {
              stack: error.stack,
              data: res.data
            });

          case 403:
            throw new ForbiddenError(error.config.url, {
              stack: error.stack,
              data: res.data
            });

          case 404:
            throw new NotFoundError(error.config.url, error.stack);

          default:
            if (i === this.config.retry5xxAmount) {
              throw new RequestRetriesExceededError(
                `Request exceeded ${this.config.retry5xxAmount} number of retry attempts, failed with status code ${statusCode}`,
                error.config.url,
                error.stack
              );
            }
        }
      }
    }
  }

  protected getStorefront(storefront?: string): string {
    const result = storefront ?? this.config.defaultStorefront;

    if (!result) {
      throw new Error(
        `Specify storefront with function parameter or default one with Client's constructor`
      );
    }

    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected request(method: Method, apiPath: string, params?: any): AxiosPromise {
    return this.client.request({
      method: method,
      url: apiPath,
      params: params
    });
  }
}
