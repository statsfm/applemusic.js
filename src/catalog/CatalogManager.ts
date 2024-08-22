import { HttpClient } from '../http/HttpClient';
import { ResponseRoot } from '../interfaces/AppleMusic';
import {
  Manager,
  Options,
  buildQuery,
  extractResponseData,
  getStorefrontOrThrow
} from '../Manager';

export class CatalogManager<T extends ResponseRoot> extends Manager<T> {
  constructor(
    client: HttpClient,
    // eslint-disable-next-line no-unused-vars
    private readonly entity: string
  ) {
    super(client);
  }

  async get(id: string, options: Partial<Options> = {}): Promise<T> {
    const query = buildQuery(this.http.config, options);
    const storefront = getStorefrontOrThrow(this.http.config, options);
    const url = this.http.getURL(`/v1/catalog/${storefront}/${this.entity}/${id}`, query);
    const response = await this.http.get<T>(url);

    return extractResponseData<T>(response);
  }

  async getMany(options: Partial<Options> = {}): Promise<T> {
    const query = buildQuery(this.http.config, options);
    const storefront = getStorefrontOrThrow(this.http.config, options);
    const url = this.http.getURL(`/v1/catalog/${storefront}/${this.entity}`, query);
    const response = await this.http.get<T>(url);

    return extractResponseData<T>(response);
  }
}
