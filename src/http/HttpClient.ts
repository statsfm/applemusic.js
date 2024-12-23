/* eslint-disable no-console */
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse
} from 'axios';
import * as https from 'https';
import { ClientRequest } from 'http';
import axiosRetry, { retryAfter } from 'axios-retry';
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
import { parseWithDates } from '../util/json';

const RETRY_DELAY_MS = 1_000;

export class HttpClient {
  protected baseURL = 'https://api.music.apple.com';
  protected client = this.createClient();

  constructor(readonly config: ClientConfiguration) {
    if (config.http?.baseURL) {
      this.baseURL = config.http.baseURL;
    }
  }

  /**
   * @param {string} pathname
   * @param {URLSearchParams} query
   * @returns {string} Returns the full url.
   */
  getURL(pathname: string, query: URLSearchParams): string {
    const url = new URL(this.baseURL);

    url.pathname = pathname;
    url.search = query.toString();

    return url.toString();
  }

  /**
   * Create an axios instance, set interceptors, handle errors & auth.
   */
  private createClient(): AxiosInstance {
    const config: AxiosRequestConfig = {
      proxy: this.config.http?.proxy,
      headers: {
        ...this.config.http?.headers,
        Origin: 'https://music.apple.com',
        'User-Agent':
          this.config.http?.userAgent ??
          '@statsfm/applemusic.js (https://github.com/statsfm/applemusic.js)'
      },
      // https://github.com/axios/axios/blob/v0.20.0-0/lib/defaults.js#L57-L65
      transformResponse: [
        (value: string): unknown => {
          if (typeof value !== 'string') {
            return value;
          }

          try {
            return parseWithDates(value, this.config.dateKeys || null);
          } catch (_error) {
            return value;
          }
        }
      ]
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

    const maxRetryAttempts = this.config.retry5xxAmount ?? 3;

    const getRetryDelay = (_retryCount: number, error: AxiosError): number => {
      return Math.max(RETRY_DELAY_MS, retryAfter(error));
    };

    const validateResponse = (response: AxiosResponse): boolean => {
      return response.status < 500 && response.status !== 429;
    };

    const shouldRetry = (error: AxiosError): boolean => this.shouldRetryRequest(error);

    const onRetry = (retryCount: number, error: AxiosError, config: AxiosRequestConfig): void => {
      if (this.config.debug || this.config.logRetry) {
        console.debug(`(${retryCount}/${maxRetryAttempts}) retry ${config.url} - ${error}`);
      }
    };

    const onMaxRetryTimesExceeded = (error: AxiosError): void => {
      if (maxRetryAttempts === 0) {
        return;
      }

      throw new RequestRetriesExceededError(
        `Request ${maxRetryAttempts} retry attempts exceeded`,
        error.config.url,
        error.stack
      );
    };

    const client = axios.create(config);

    client.interceptors.request.use((config) => {
      const { developerToken, mediaUserToken } = this.config;

      config.headers.Authorization = `Bearer ${developerToken}`;

      if (mediaUserToken) {
        config.headers['Media-User-Token'] = mediaUserToken;
      }

      return config;
    });

    axiosRetry(client, {
      retries: maxRetryAttempts,
      retryDelay: getRetryDelay,
      validateResponse,
      retryCondition: shouldRetry,
      onRetry,
      onMaxRetryTimesExceeded
    });

    client.interceptors.response.use(
      (response) => this.handleResponse(response),
      (err: unknown) => this.handleError(err)
    );

    axiosBetterStacktrace(client);

    return client;
  }

  private shouldRetryRequest(error: unknown): boolean {
    if (axios.isCancel(error) || axios.isAxiosError(error) === false) {
      return false;
    }

    if (axiosRetry.isNetworkError(error)) {
      return true;
    }

    if (!error.response) {
      return this.config.retry5xx !== false;
    }

    const { status } = error.response;

    if (status === 429) {
      return this.config.retry !== false;
    }

    if (status >= 500 && status < 600) {
      return this.config.retry5xx !== false;
    }

    return false;
  }

  private handleResponse(response: AxiosResponse): AxiosResponse {
    const { status, data, config } = response;

    switch (status) {
      case 400:
        throw new BadRequestError(config.url, data.errors);

      case 401:
        throw new UnauthorizedError(config.url);

      case 403:
        throw new ForbiddenError(config.url);

      case 404:
        throw new NotFoundError(config.url);
    }

    return response;
  }

  private handleError(err: unknown): unknown {
    if (axios.isCancel(err) || axios.isAxiosError(err) === false || !err.response) {
      throw err;
    }

    const { response } = err;
    const { status, headers } = response;

    if (status === 429) {
      throw new RatelimitError(err.config.url, headers['retry-after']);
    }

    throw err;
  }

  get<T>(url: string, config?: AxiosRequestConfig): AxiosPromise<T> {
    return this.client.get(url, config);
  }
}
