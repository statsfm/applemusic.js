import { Resource } from './resource';
import { Artwork } from './artwork';
import { EditorialNotes } from './editorialNotes';
import { PlaylistRelationship } from './playlistRelationship';

// https://developer.apple.com/documentation/applemusicapi/curator
export interface Curator extends Resource {
  attributes?: Curator.Attributes;
  relationships?: Curator.Relationships;
  type: 'curators';
}

namespace Curator {
  // https://developer.apple.com/documentation/applemusicapi/curator/attributes
  export interface Attributes {
    artwork: Artwork; // Required: The curator artwork
    editorialNotes?: EditorialNotes; // Optional: The notes about the curator
    name: string; // Required: The localized name of the curator
    url: string; // Required: The URL for sharing the curator in Apple Music
  }

  // https://developer.apple.com/documentation/applemusicapi/curator/relationships
  export interface Relationships {
    playlists?: PlaylistRelationship;
  }
}
