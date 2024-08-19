/* eslint-disable no-console */
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosPromise,
  AxiosRequestConfig,
  InternalAxiosRequestConfig
} from 'axios';
import * as https from 'https';
import { ClientRequest } from 'http';
import axiosBetterStacktrace from 'axios-better-stacktrace';
import { ClientConfiguration } from '../interfaces/Config';
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

type ConfigWithRetry = InternalAxiosRequestConfig & { retryAttempt?: number };

export class HttpClient {
  protected baseURL = 'https://api.music.apple.com';
  protected client = this.createClient();

  constructor(readonly config: ClientConfiguration) {
    if (config.http?.baseURL) {
      this.baseURL = config.http.baseURL;
    }
  }

  /**
   * Create an axios instance, set interceptors, handle errors & auth.
   */
  private createClient(): AxiosInstance {
    const config: AxiosRequestConfig = {
      baseURL: this.baseURL,
      proxy: this.config.http?.proxy,
      headers: {
        ...this.config.http?.headers,
        Origin: 'https://music.apple.com',
        'User-Agent':
          this.config.http?.userAgent ??
          '@statsfm/applemusic.js (https://github.com/statsfm/applemusic.js)',
        'Media-User-Token': this.config.mediaUserToken ?? ''
      },
      // https://github.com/axios/axios/blob/v0.20.0-0/lib/defaults.js#L57-L65
      transformResponse: [
        (value: string): unknown => {
          if (typeof value !== 'string') {
            return value;
          }

          try {
            return parseWithDates(value);
          } catch (e) {
            return value;
          }
        }
      ],
      validateStatus: () => true // Handle errors by ourselves
    };

    if (this.config.http?.localAddress) {
      config.transport = {
        ...https,
        request: (options, callback): ClientRequest =>
          https.request(
            {
              ...options,
              localAddress: this.config.http?.localAddress,
              family: this.config.http?.localAddress.includes(':') ? 6 : 4
            },
            callback
          )
      };
    }

    const client = axios.create(config);

    axiosBetterStacktrace(client);

    client.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${this.config.developerToken}`;

      return config;
    });

    // error handling interceptor
    client.interceptors.response.use(
      (response) => response,
      (err: unknown) => this.handleError(client, err)
    );

    return client;
  }

  private async handleError(client: AxiosInstance, err: unknown): AxiosPromise {
    if (axios.isCancel(err) || axios.isAxiosError(err) === false || !this.shouldRetryRequest(err)) {
      return await Promise.reject(this.extractResponseError(err));
    }

    const requestConfig = err.config as ConfigWithRetry;

    requestConfig.retryAttempt ||= 0;

    const isRateLimited = err.response && err.response.status === 429;

    if (isRateLimited) {
      if (this.config.logRetry) {
        console.log(err.response);
      }

      const retryAfter = Number(err.response.headers['retry-after']) || 0;

      if (this.config.logRetry || this.config.logRetry === undefined) {
        console.error(
          `Hit ratelimit, retrying in ${retryAfter} second(s), path: ${err.request.path}`
        );
      }

      await sleep(retryAfter * 1_000);

      requestConfig.retryAttempt = 0;
    } else {
      await sleep(1_000);

      requestConfig.retryAttempt! += 1;

      if (this.config.debug) {
        console.log(
          `(${requestConfig.retryAttempt}/${this.maxRetryAttempts}) retry ${requestConfig.url} - ${err}`
        );
      }
    }

    return await client.request(requestConfig);
  }

  private shouldRetryRequest(err: AxiosError): boolean {
    // non-response errors should clarified as 5xx and retried (socket hangup, ECONNRESET, etc.)
    if (!err.response) {
      if (this.config.retry5xx === false) {
        return false;
      }

      const { retryAttempt = 0 } = err.config as ConfigWithRetry;

      return retryAttempt < this.maxRetryAttempts;
    }

    const { status } = err.response;

    if (status === 429) {
      return this.config.retry !== false;
    }

    if (status >= 500 && status < 600) {
      if (this.config.retry5xx === false) {
        return false;
      }

      const { retryAttempt = 0 } = err.config as ConfigWithRetry;

      return retryAttempt < this.maxRetryAttempts;
    }

    return false;
  }

  private extractResponseError(err: unknown): unknown {
    if (axios.isCancel(err) || axios.isAxiosError(err) === false) {
      return err;
    }

    // non-response errors should clarified as 5xx and retried (socket hangup, ECONNRESET, etc.)
    if (!err.response) {
      const { retryAttempt = 0 } = err.config as ConfigWithRetry;

      if (this.config.retry5xx === false || retryAttempt < this.maxRetryAttempts) {
        return err;
      }

      return new RequestRetriesExceededError(
        `Request max${this.maxRetryAttempts} retry attempts exceeded`,
        err.config.url,
        err.stack
      );
    }

    const { stack, config, response } = err;
    const { status, headers, data } = response;

    if (status >= 500 && status < 600) {
      const { retryAttempt } = err.config as ConfigWithRetry;

      if (this.config.retry5xx === false || retryAttempt < this.maxRetryAttempts) {
        return err;
      }

      return new RequestRetriesExceededError(
        `Request ${this.maxRetryAttempts} retry attempts exceeded`,
        err.config.url,
        err.stack
      );
    }

    switch (status) {
      case 400:
        return new BadRequestError(config.url, {
          stack,
          data
        });

      case 401:
        return new UnauthorizedError(config.url, {
          stack,
          data
        });

      case 403:
        return new ForbiddenError(config.url, {
          stack,
          data
        });

      case 404:
        throw new NotFoundError(config.url, stack);

      case 429:
        return new RatelimitError(
          `Hit ratelimit, retry after ${headers['retry-after']} seconds`,
          err.config.url,
          {
            stack,
            data
          }
        );
    }

    return err;
  }

  private get maxRetryAttempts(): number {
    return this.config.retry5xxAmount ?? 3;
  }

  get<T>(url: string, config: AxiosRequestConfig): AxiosPromise<T> {
    return this.client.get(url, config);
  }
}
