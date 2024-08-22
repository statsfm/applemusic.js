import { HttpClient } from '../http/HttpClient';
import { ResponseRoot } from '../interfaces/AppleMusic';
import { Manager, Options, buildQuery, extractResponseData } from '../Manager';

export class LibraryManager<T extends ResponseRoot> extends Manager<T> {
  constructor(
    client: HttpClient,
    // eslint-disable-next-line no-unused-vars
    private readonly entity: string
  ) {
    super(client);
  }

  async get(id: string, options: Partial<Options> = {}): Promise<T> {
    const query = buildQuery(this.http.config, options);
    const url = this.http.getURL(`/v1/me/library/${this.entity}/${id}`, query);
    const response = await this.http.get<T>(url);

    return extractResponseData<T>(response);
  }

  async getMany(options: Partial<Options> = {}): Promise<T> {
    const query = buildQuery(this.http.config, options);
    const url = this.http.getURL(`/v1/me/library/${this.entity}`, query);
    const response = await this.http.get<T>(url);

    return extractResponseData<T>(response);
  }
}
