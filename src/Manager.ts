import { AppleMusicError } from './AppleMusicError';
import type { ResponseRoot } from './interfaces/AppleMusic/responseRoot';
import type { Error } from './interfaces/AppleMusic/error';
import { HttpClient } from './http/HttpClient';
import { URLBuilder, Options } from './urls/URLBuilder';

interface Parameters {
  l?: string;
  term?: string;
}

export class Manager<T extends ResponseRoot> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly urlBuilder: URLBuilder,
    // eslint-disable-next-line no-unused-vars
    private readonly http: HttpClient
  ) {}

  protected getStorefrontOrThrow(options?: Options): string {
    const result = options?.storefront ?? this.http.config.defaultStorefront;

    if (result) {
      return result;
    }

    throw new Error(
      `Specify storefront with function parameter or default one with Client's constructor`
    );
  }

  async getByUrl(url: string, options?: Options): Promise<T> {
    const params: Parameters = {
      l: options?.languageTag ?? this.http.config.defaultLanguageTag
    };

    const { status, data } = await this.http.get<T>(url, {
      params
    });

    if (!data) {
      throw new AppleMusicError(`Request to ${url} failed with status code ${status}`, status);
    }

    // https://developer.apple.com/documentation/applemusicapi/handling_requests_and_responses#3001632
    if (data.errors) {
      const [error] = data.errors;

      throw new AppleMusicError(error.title, status, data);
    }

    return data;
  }

  async get(id: string, options?: Options): Promise<T> {
    const url = this.urlBuilder.getOneUrl(id, this.getStorefrontOrThrow(options), options);

    return await this.getByUrl(url, options);
  }

  async getMany(options?: Options): Promise<T> {
    const url = this.urlBuilder.getManyUrl(this.getStorefrontOrThrow(options), options);

    return await this.getByUrl(url, options);
  }
}
