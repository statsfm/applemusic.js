import { Resource } from './resource';

// https://developer.apple.com/documentation/applemusicapi/genre
export interface Genre extends Resource {
  attributes?: Genre.Attributes;
  type: 'genres';
}

namespace Genre {
  // https://developer.apple.com/documentation/applemusicapi/genre/attributes
  export interface Attributes {
    name: string; // Required: The localized name of the genre
    parentId?: string; // Optional: The identifier of the parent genre
    parentName?: string; // Optional: The localized name of the parent genre
    chartLabel?: string; // Optional: A localized string for displaying the genre in relation to charts
  } 
}
