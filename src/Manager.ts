import type { AxiosResponse } from 'axios';

import { HttpClient } from './http/HttpClient';
import type { ClientConfiguration } from './interfaces/Config';
import type { ResponseRoot, Relationship } from './interfaces/AppleMusic';
import { AppleMusicError } from './AppleMusicError';

type SearchType = 'songs' | 'artists' | 'albums' | 'playlists';

export interface Options {
  storefront: string;
  languageTag: string;
  searchTypes: SearchType[];
  query: URLSearchParams;
}

export function getStorefrontOrThrow(
  config: ClientConfiguration,
  options: Partial<Options>
): string {
  const result = options.storefront ?? config.defaultStorefront;

  if (result) {
    return result;
  }

  throw new Error(
    'Please specify storefront value using method options or set default using constructor options'
  );
}

export function buildQuery(
  config: ClientConfiguration,
  options: Partial<Options>
): URLSearchParams {
  const query = new URLSearchParams(options.query);
  const lang = options.languageTag ?? config.defaultLanguageTag;

  if (lang) {
    query.set('l', lang);
  }

  return query;
}

export function extractResponseData<T extends ResponseRoot>(response: AxiosResponse<T>): T {
  const { status, data, config } = response;

  if (!data) {
    throw new AppleMusicError(`Request to ${config.url} failed with status code ${status}`, status);
  }

  // https://developer.apple.com/documentation/applemusicapi/handling_requests_and_responses#3001632
  if (data.errors) {
    const [error] = data.errors;

    throw new AppleMusicError(error.title, status, data);
  }

  return data;
}

export abstract class Manager<T> {
  // eslint-disable-next-line no-unused-vars
  constructor(protected readonly http: HttpClient) {}

  // eslint-disable-next-line no-unused-vars
  abstract get(id: string, options: Partial<Options>): Promise<T>;

  // eslint-disable-next-line no-unused-vars
  abstract getMany(options: Partial<Options>): Promise<T>;

  /* eslint-disable no-unused-vars */
  abstract getRelationship<R extends Relationship>(
    id: string,
    relationship: string,
    options: Partial<Options>
  ): Promise<R>;
  /* eslint-disable no-unused-vars*/
}
