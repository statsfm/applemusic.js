import { Options } from '../resourceClient';
import ApiUrlBuilder from './apiUrlBuilder';

export default class LibraryUrl extends ApiUrlBuilder {
  getManyUrl(_: string, params?: Options) {
    const query = !!params?.query ? `?${this.buildQuery(params)}` : '';
    return `me/library/${this.urlName!}${query}`;
  }
}
