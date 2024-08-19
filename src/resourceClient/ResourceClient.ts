import { AppleMusicError } from '../AppleMusicError';
import type { ResponseRoot } from '../interfaces/AppleMusic/responseRoot';
import type { Error } from '../interfaces/AppleMusic/error';
import { HttpClient } from '../http/HttpClient';
import ApiUrlBuilder from './apiUrlBuilder/apiUrlBuilder';
import { ClientConfiguration } from 'src/interfaces/Config';

interface Parameters {
  l?: string;
  term?: string;
}

export interface Options {
  storefront?: string;
  languageTag?: string;
  searchTypes?: ('songs' | 'artists' | 'albums' | 'playlists')[];
  query?: URLSearchParams;
}

export class ResourceClient<T extends ResponseRoot> extends HttpClient {
  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly urlBuilder: ApiUrlBuilder,
    public readonly config: ClientConfiguration
  ) {
    super(config);
  }

  protected getStorefront(storefront?: string): string {
    const result = storefront ?? this.config.defaultStorefront;

    if (result) {
      return result;
    }

    throw new Error(
      `Specify storefront with function parameter or default one with Client's constructor`
    );
  }

  async getByUrl(url: string, options?: Options): Promise<T> {
    const params: Parameters = {
      l: options?.languageTag ?? this.config.defaultLanguageTag
    };

    const httpResponse = await this.request('GET', url, params);

    if (!httpResponse.data) {
      throw new AppleMusicError(
        `Request to ${url} failed with status code ${httpResponse.status}`,
        httpResponse.status
      );
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
    const url = this.urlBuilder.getOneUrl(id, this.getStorefront(options?.storefront), options);
    return await this.getByUrl(url, options);
  }

  async getMany(options?: Options): Promise<T> {
    const url = this.urlBuilder.getManyUrl(this.getStorefront(options?.storefront), options);
    return await this.getByUrl(url, options);
  }
}
