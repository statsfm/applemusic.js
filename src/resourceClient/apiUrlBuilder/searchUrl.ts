import { Options } from '../resourceClient';
import ApiUrlBuilder from './apiUrlBuilder';

export default class SearchUrl extends ApiUrlBuilder {
  // @ts-expect-error
  getManyUrl(storefront: string, params?: Options): string {
    throw new Error('Method not implemented.');
  }

  getOneUrl(term: string, storefront: string, params?: Options): string {
    const query = `?${this.buildSearchQuery({ ...params, term })}`;
    return `/v1/catalog/${storefront}/search${query}`;
  }

  private buildSearchQuery(params: Options & { term: string }) {
    const searchParams = new URLSearchParams({
      term: params.term
    });

    if (params.searchTypes) {
      searchParams.set('types', params.searchTypes.join(','));
    }

    if (params.query) {
      params.query.forEach((value, key) => {
        searchParams.set(key, value);
      });
    }

    return searchParams.toString();
  }
}
