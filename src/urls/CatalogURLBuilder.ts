import { URLBuilder, Options } from './URLBuilder';

export class CatalogURLBuilder extends URLBuilder {
  getManyUrl(storefront: string, params?: Options): string {
    const query = !!params?.query ? `?${this.buildQuery(params)}` : '';
    return `/v1/catalog/${storefront}/${this.urlName!}${query}`;
  }
}
