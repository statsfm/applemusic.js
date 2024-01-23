import { Options } from '../resourceClient';

export default abstract class ApiUrlBuilder {
  constructor(protected urlName?: string) {}

  abstract getManyUrl(storefront: string, params?: Options): string;

  getOneUrl(id: string, storefront: string, params?: Options): string {
    return this.getManyUrl(storefront, params) + `/${id}`;
  }
}
