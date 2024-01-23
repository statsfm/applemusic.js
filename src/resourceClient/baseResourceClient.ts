import axios, { AxiosError, AxiosInstance, AxiosPromise, AxiosRequestConfig, Method } from 'axios';
import * as https from 'https';
import axiosBetterStacktrace from 'axios-better-stacktrace';
import { ClientConfiguration } from '../clientConfiguration';
import { CalendarDate } from '../calendarDate';
import ApiUrlBuilder from './apiUrlBuilder/apiUrlBuilder';
import { ClientRequest } from 'http';
import { AuthError, BadRequestError, ForbiddenError, NotFoundError, RatelimitError } from './errors';

export class BaseResourceClient {
  protected client: AxiosInstance = this.create({ resInterceptor: true });

  constructor(public urlBuilder: ApiUrlBuilder, public config: ClientConfiguration) {}

  // create axios client, set interceptors, handle errors & auth
  private create(options: { resInterceptor?: boolean }): AxiosInstance {
    const config: AxiosRequestConfig = {
      baseURL: 'https://api.music.apple.com/v1',
      proxy: this.config.http?.proxy,
      // https://github.com/axios/axios/blob/v0.20.0-0/lib/defaults.js#L57-L65
      transformResponse: [
        data => {
          /*eslint no-param-reassign:0*/
          if (typeof data === 'string') {
            try {
              data = parseJSONWithDateHandling(data);
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
      // TODO: https://github.com/axios/axios/issues/3876
      // @ts-expect-error `transport` is not included in axios types (see https://github.com/axios/axios/issues/3876)
      config.transport = {
        ...https,
        request: (options: any, callback: any): ClientRequest =>
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

    // request interceptor
    client.interceptors.request.use(async config => {
      // add authorization, content
      config.headers = {
        Authorization: `Bearer ${this.config.developerToken}`,
        'media-user-token': this.config.mediaUserToken || '',
        origin: 'https://music.apple.com',
        // TODO: add user agent
        ...config.headers
      };

      return config;
    });

    if (options.resInterceptor || options.resInterceptor === undefined) {
      // response interceptor
      client.interceptors.response.use(
        config => config,
        // error handler
        async (err: AxiosError) => {
          let res = err.response;

          if (res?.status) {
            // throw error if bad request
            if (res.status === 400) {
              throw new BadRequestError(
                `bad request (${err.config.url})\n${JSON.stringify(err.response?.data, null, ' ')}`,
                err.stack
              );
            }

            // throw error if forbideden
            if (res.status === 403) {
              throw new ForbiddenError(
                `forbidden, are you sure you have the right scopes? (${err.config.url})\n${JSON.stringify(
                  res.data,
                  null,
                  ' '
                )}`,
                err.stack
              );
            }

            // throw error if 404
            if (res.status === 404) {
              throw new NotFoundError(`not found (${res.config.url})`, err.stack);
            }

            if (res.status === 401) {
              throw new AuthError(`unauthorized (${err.config.url}) ${JSON.stringify(res.data, null, ' ')}`, err.stack);
            }

            // 5xx
            if (res.status.toString().startsWith('5')) {
              if (this.config.retry5xx || this.config.retry5xx === undefined) {
                // set default
                if (!this.config.retry5xxAmount) this.config.retry5xxAmount = 3;

                // create new axios client without interceptors
                const nClient = this.create({ resInterceptor: false });

                // retry x times
                for (let i = 0; i < this.config.retry5xxAmount; i++) {
                  console.log(`${res.status} error, retrying... (${i + 1}/${this.config.retry5xxAmount})`);

                  // timeout one second
                  // eslint-disable-next-line no-await-in-loop
                  await this.sleep(i * 1000); // wait for retry time

                  // disable error checking
                  // err.config.validateStatus = (): boolean => true;

                  try {
                    // retry request
                    // eslint-disable-next-line no-await-in-loop
                    const nRes = await nClient.request(err.config);

                    // starts with 200, successful
                    if (nRes.status.toString().startsWith('2')) {
                      return nRes;
                    }
                  } catch (err) {
                    if (i === this.config.retry5xxAmount - 1) {
                      throw new Error(
                        `${res.status} error, retried ${this.config.retry5xxAmount} times\n${(err as Error)?.stack}`
                      );
                    }
                  }
                }
              }
            }

            // if (res.status === 500) {
            //   throw new InternalServerError('internal server error', err.stack);
            // }

            if (res.status === 429) {
              if (this.config.logRetry) {
                console.log(res);
              }
              if (this.config.retry || this.config.retry === undefined) {
                const retry = (res.headers[`retry-after`] as unknown) as number; // get retry time

                // log ratelimit (if enabled)
                if (this.config.logRetry || this.config.logRetry === undefined) {
                  // eslint-disable-next-line no-console
                  console.error(
                    `hit ratelimit, retrying in ${retry} second(s), localAddress: ${this.config.http?.localAddress}, path: ${err.request.path}`
                  );
                }

                await this.sleep(retry * 1000); // wait for retry time
                res = await client.request(err.config); // retry request
              } else {
                throw new RatelimitError(`hit ratelimit (${err.config.url})`, err.stack);
              }
              return res;
            }
          }

          throw err;
        }
      );
    }

    return client;
  }

  protected getStorefront(storefront?: string): string {
    const result = storefront || this.config.defaultStorefront;

    if (!result) {
      throw new Error(`Specify storefront with function parameter or default one with Client's constructor`);
    }

    return result;
  }

  protected request(method: Method, apiPath: string, params?: any): AxiosPromise {
    console.log(apiPath);
    return this.client.request({
      method: method,
      url: apiPath,
      params: params
    });
  }

  /**
   * Sleep function.
   * @param {number} delay Delay in milliseconds.
   */
  private sleep(delay: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

function parseJSONWithDateHandling(json: string) {
  return JSON.parse(json, (_key: any, value: any) => {
    if (typeof value !== 'string') {
      return value;
    }

    const calendarDate = CalendarDate.parse(value);

    if (calendarDate) {
      return calendarDate;
    }

    if (value.match(datePattern)) {
      return new Date(value);
    }

    return value;
  });
}
