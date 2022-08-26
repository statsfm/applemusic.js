import ApiUrlBuilder from "./apiUrlBuilder";

export default class LibraryUrl extends ApiUrlBuilder 
{
    getManyUrl() {
        return `me/library/${this.urlName}`;
    }    
}
