export default abstract class ApiUrlBuilder {
    constructor(protected urlName: string) {}

    abstract getManyUrl(storefront: string): string;

    getOneUrl(id: string, storefront: string): string {
        return this.getManyUrl(storefront) + `/${id}`;
    }
}
