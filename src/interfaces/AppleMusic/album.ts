import { CalendarDate } from '../../util/CalendarDate';

import { Resource } from './resource';
import { Artwork } from './artwork';
import { ContentRating } from './contentRating';
import { EditorialNotes } from './editorialNotes';
import { PlayParameters } from './playParameters';
import { ArtistRelationship } from './artistRelationship';
import { GenreRelationship } from './genreRelationship';
import { TrackRelationship } from './trackRelationship';
import { LibraryRelationship } from './libraryRelationship';
import { RecordLabelRelationship } from './recordLabelRelationship';

// https://developer.apple.com/documentation/applemusicapi/album
export interface Album extends Resource {
  attributes?: Album.Attributes;
  relationships?: Album.Relationships;
  type: 'albums';
}

namespace Album {
  // https://developer.apple.com/documentation/applemusicapi/albums/attributes
  export interface Attributes {
    albumName: string;
    artistName: string;
    artistUrl?: string; // New field
    artwork?: Artwork;
    audioVariants?: string[]; // New field, with specific possible values
    contentRating?: ContentRating; // Can now take string values like 'clean' or 'explicit'
    copyright?: string;
    editorialNotes?: EditorialNotes;
    genreNames: string[];
    isCompilation: boolean; // New field
    isComplete: boolean;
    isMasteredForItunes: boolean;
    isSingle: boolean;
    name: string;
    playParams?: PlayParameters;
    recordLabel: string;
    releaseDate?: string; // Updated to string
    trackCount: number;
    upc?: string;
    url: string;
  }
  

  // https://developer.apple.com/documentation/applemusicapi/album/relationships
  export interface Relationships {
    artists?: ArtistRelationship; // The artists associated with the album (10 default, 10 max)
    genres?: GenreRelationship; // The genres for the album, not included by default
    tracks?: TrackRelationship; // The songs and music videos on the album (300 default, 300 max)
    library?: LibraryRelationship; // New relationship: The album in the user’s library for the catalog album, if any
    'record-labels'?: RecordLabelRelationship; // New relationship: The record labels for the album (10 default, 10 max)
  }  
}
