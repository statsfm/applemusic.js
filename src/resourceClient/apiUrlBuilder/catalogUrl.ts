import ApiUrlBuilder from './apiUrlBuilder';

export default class CatalogUrl extends ApiUrlBuilder {
  getManyUrl(storefront: string) {
    return `/catalog/${storefront}/${this.urlName!}`;
  }
}
