import { Artwork } from './artwork';
import { Resource } from './resource';
import { AlbumRelationship } from './albumRelationship'; // Assuming this is for releases related to the record label

export interface RecordLabel extends Resource {
  attributes?: RecordLabel.Attributes;
  views?: RecordLabel.Views;
  type: 'record-labels';
}

export namespace RecordLabel {
  export interface Attributes {
    artwork: Artwork; // Required: Artwork associated with the content
    description?: string; // Optional: A map of description information (could be expanded if needed)
    name: string; // Required: The (potentially) censored name of the content
    url: string; // Required: The URL to load the record label from
  }

  export interface Views {
    'latest-releases'?: RecordLabelLatestReleasesView; // New relationship for the latest releases
    'top-releases'?: RecordLabelTopReleasesView; // New relationship for the top releases
  }

  // Define the Views for latest and top releases
  export interface RecordLabelLatestReleasesView {
    data: AlbumRelationship[]; // Assuming this points to albums (could change if it refers to something else)
  }

  export interface RecordLabelTopReleasesView {
    data: AlbumRelationship[]; // Assuming this points to albums (could change if it refers to something else)
  }
}
