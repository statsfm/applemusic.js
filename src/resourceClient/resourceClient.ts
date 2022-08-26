import { AppleMusicError } from '../appleMusicError';
import { ResponseRoot } from '../serverTypes/responseRoot';
import { Error } from '../serverTypes/error';
import { BaseResourceClient } from './baseResourceClient';

interface Parameters {
  l?: string;
}

interface Options {
  storefront?: string; 
  languageTag?: string
}

export class ResourceClient<T extends ResponseRoot> extends BaseResourceClient {
  async getByUrl(url: string, options?: Options): Promise<T> {
    let params: Parameters = {
      l: options?.languageTag || this.configuration.defaultLanguageTag
    };

    const httpResponse = await this.request('GET', url, params);

    if (!httpResponse.data) {
      throw new AppleMusicError(`Request failed with status code ${httpResponse.status}`, httpResponse.status);
    }

    const apiResponse = httpResponse.data as ResponseRoot;

    // https://developer.apple.com/documentation/applemusicapi/handling_requests_and_responses#3001632
    if (!apiResponse.errors) {
      return apiResponse as T;
    } else {
      const error = apiResponse.errors[0] as Error;
      throw new AppleMusicError(error.title, httpResponse.status, apiResponse);
    }
  }

  async get(id: string, options?: Options): Promise<T> {
    const url = this.urlBuilder.getOneUrl(id, this.getStorefront(options?.storefront));
    return this.getByUrl(url, options);
  }

  async getMany(options?: Options): Promise<T> {
    const url = this.urlBuilder.getManyUrl(this.getStorefront(options?.storefront));
    return this.getByUrl(url, options);
  }  
}
