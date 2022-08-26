import axios, { AxiosInstance, AxiosPromise, Method } from 'axios';

import { ClientConfiguration } from '../clientConfiguration';
import { CalendarDate } from '../calendarDate';
import ApiUrlBuilder from './apiUrlBuilder/apiUrlBuilder';

export class BaseResourceClient {
  protected axiosInstance: AxiosInstance;

  constructor(public urlBuilder: ApiUrlBuilder, public configuration: ClientConfiguration) {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.music.apple.com/v1',
      headers: {
        Authorization: `Bearer ${this.configuration.developerToken}`,
        'media-user-token': this.configuration.mediaUserToken || '',
        origin: 'https://music.apple.com' // TODO: remove (added to test my browser's developer token)
      },
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
    });
  }

  protected getStorefront(storefront?: string): string {
    const result = storefront || this.configuration.defaultStorefront;

    if (!result) {
      throw new Error(`Specify storefront with function parameter or default one with Client's constructor`);
    }

    return result;
  }

  protected request(method: Method, apiPath: string, params?: any): AxiosPromise {
    return this.axiosInstance.request({
      method: method,
      url: apiPath,
      params: params
    });
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
