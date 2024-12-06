import { HttpClient } from '../http/HttpClient';
import { Relationship, ResponseRoot } from '../interfaces/AppleMusic';
import {
  Manager,
  Options,
  buildQuery,
  extractResponseData,
  getStorefrontOrThrow
} from '../Manager';

export class SearchManager<T extends ResponseRoot> extends Manager<T> {
  constructor(client: HttpClient) {
    super(client);
  }

  async get(term: string, options: Partial<Options> = {}): Promise<T> {
    const query = buildQuery(this.http.config, options);

    if (options.searchTypes) {
      query.set('types', options.searchTypes.join(','));
    }

    query.set('term', term);

    const storefront = getStorefrontOrThrow(this.http.config, options);
    const url = this.http.getURL(`/v1/catalog/${storefront}/search`, query);
    const response = await this.http.get<T>(url);

    return extractResponseData<T>(response);
  }

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  getMany(_options: Partial<Options> = {}): Promise<T> {
    throw new Error('Method not implemented');
  }

  /* eslint-disable no-unused-vars,@typescript-eslint/no-unused-vars */
  getRelationship<R extends Relationship>(
    id: string,
    relationship: string,
    options: Partial<Options>
  ): Promise<R> {
    throw new Error('Method not implemented.');
  }
  /* eslint-disable no-unused-vars,@typescript-eslint/no-unused-vars */
}
