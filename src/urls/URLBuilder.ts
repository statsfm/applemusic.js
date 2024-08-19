export interface Options {
  storefront?: string;
  languageTag?: string;
  searchTypes?: ('songs' | 'artists' | 'albums' | 'playlists')[];
  query?: URLSearchParams;
}

export abstract class URLBuilder {
  // eslint-disable-next-line no-unused-vars
  constructor(protected urlName?: string) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  abstract getManyUrl(storefront: string, params?: Options): string;

  getOneUrl(id: string, storefront: string, params?: Options): string {
    const query = !!params?.query ? `?${this.buildQuery(params)}` : '';
    return `${this.getManyUrl(storefront)}/${id}${query}`;
  }

  buildQuery(params?: Options): string {
    if (params == undefined || params == null) return '';

    const searchParams = new URLSearchParams();
    if (params.query) {
      params.query.forEach((value, key) => {
        searchParams.set(key, value);
      });
    }

    return searchParams.toString();
  }
}
