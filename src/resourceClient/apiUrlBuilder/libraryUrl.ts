import { Options } from '../resourceClient';
import ApiUrlBuilder from './apiUrlBuilder';

export default class LibraryUrl extends ApiUrlBuilder {
  getManyUrl(_storefront: string, params?: Options): string {
    const query = !!params?.query ? `?${this.buildQuery(params)}` : '';
    return `/v1/me/library/${this.urlName!}${query}`;
  }
}
