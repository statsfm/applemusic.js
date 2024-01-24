import { Options } from '../resourceClient';
import ApiUrlBuilder from './apiUrlBuilder';

export default class CatalogUrl extends ApiUrlBuilder {
  getManyUrl(storefront: string, params?: Options): string {
    const query = !!params?.query ? `?${this.buildQuery(params)}` : '';
    return `/catalog/${storefront}/${this.urlName!}${query}`;
  }
}
