import { CalendarDate } from '../../util/CalendarDate';

import { Resource } from './resource';
import { Artwork } from './artwork';
import { ContentRating } from './contentRating';
import { EditorialNotes } from './editorialNotes';
import { PlayParameters } from './playParameters';
import { Preview } from './preview';
import { AlbumRelationship } from './albumRelationship';
import { ArtistRelationship } from './artistRelationship';
import { GenreRelationship } from './genreRelationship';
import { LibraryRelationship } from './libraryRelationship';
import { SongRelationship } from './songRelationship';

// https://developer.apple.com/documentation/applemusicapi/musicvideo
export interface MusicVideo extends Resource {
  attributes?: MusicVideo.Attributes;
  relationships?: MusicVideo.Relationships;
  type: 'musicVideos';
}

namespace MusicVideo {
  // https://developer.apple.com/documentation/applemusicapi/musicvideo/attributes
  export interface Attributes {
    albumName?: string;
    artistName: string; // Required
    artistUrl?: string; // New field
    artwork: Artwork; // Required
    contentRating?: ContentRating; // Can now take string values like 'clean' or 'explicit'
    durationInMillis?: number; // Required
    editorialNotes?: EditorialNotes;
    genreNames: string[]; // Required
    has4K: boolean; // Required
    hasHDR: boolean; // Required
    isrc: string; // Required
    name: string; // Required
    playParams?: PlayParameters;
    previews: Preview[]; // Required
    releaseDate: string; // Updated to string for YYYY-MM-DD or YYYY format
    trackNumber?: number;
    url: string; // Required
    videoSubType?: string; // Updated with possible value 'preview'
    workId?: string; // New field (for classical music)
    workName?: string; // New field (for classical music)
  }
  

  // https://developer.apple.com/documentation/applemusicapi/musicvideo/relationships
  export interface Relationships {
    albums?: AlbumRelationship; // The albums associated with the music video (10 default, 10 max)
    artists?: ArtistRelationship; // The artists associated with the music video (10 default, 10 max)
    genres?: GenreRelationship; // The genres associated with the music video, not included by default
    library?: LibraryRelationship; // The library for a music video if added to the library
    songs?: SongRelationship; // The songs associated with the music video (10 default, 10 max)
  }  
}
