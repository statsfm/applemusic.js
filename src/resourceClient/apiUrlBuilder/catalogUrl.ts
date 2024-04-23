import { Options } from '../resourceClient';
import ApiUrlBuilder from './apiUrlBuilder';

export default class CatalogUrl extends ApiUrlBuilder {
  getManyUrl(storefront: string, params?: Options): string {
    const query = !!params?.query ? `?${this.buildQuery(params)}` : '';
    return `/v1/catalog/${storefront}/${this.urlName!}${query}`;
  }
}
