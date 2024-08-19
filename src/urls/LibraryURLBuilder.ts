import { URLBuilder, Options } from './URLBuilder';

export class LibraryURLBuilder extends URLBuilder {
  getManyUrl(_storefront: string, params?: Options): string {
    const query = !!params?.query ? `?${this.buildQuery(params)}` : '';
    return `/v1/me/library/${this.urlName!}${query}`;
  }
}