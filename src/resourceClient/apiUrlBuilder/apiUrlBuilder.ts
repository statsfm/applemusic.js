import { Options } from '../resourceClient';

export default abstract class ApiUrlBuilder {
  constructor(protected urlName?: string) {}

  abstract getManyUrl(storefront: string, params?: Options): string;

  getOneUrl(id: string, storefront: string, params?: Options): string {
    const query = !!params?.query ? `?${this.buildQuery(params)}` : '';
    return this.getManyUrl(storefront) + `/${id}${query}`;
  }

  buildQuery(params?: Options) {
    if (params == undefined || params == null) return '';

    const searchParams = new URLSearchParams();
    if (params.query) {
      params.query.forEach((value, key) => {
        searchParams.set(key, value);
      });
    }

    return searchParams.toString();
  }
}
