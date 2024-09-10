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
import { StationRelationship } from './stationRelationship';
import { ComposerRelationship } from './composerRelationship';
import { LibraryRelationship } from './libraryRelationship';
import { MusicVideoRelationship } from './musicVideoRelationship';

// https://developer.apple.com/documentation/applemusicapi/song
export interface Song extends Resource {
  attributes?: Song.Attributes;
  relationships?: Song.Relationships;
  type: 'songs';
}

namespace Song {
  // https://developer.apple.com/documentation/applemusicapi/song/attributes
  export interface Attributes {
    albumName: string; // Required
    artistName: string; // Required
    artistUrl?: string; // New field
    artwork: Artwork; // Required
    attribution?: string; // New field (for classical music)
    audioVariants?: string[]; // New field (e.g., dolby-atmos, hi-res-lossless)
    composerName?: string;
    contentRating?: ContentRating; // Can now take values like 'clean' or 'explicit'
    discNumber: number; // Required
    durationInMillis?: number; // Required
    editorialNotes?: EditorialNotes;
    genreNames: string[]; // Required
    hasLyrics: boolean; // New field, required
    isAppleDigitalMaster: boolean; // New field, required
    isrc: string; // Required
    movementCount?: number;
    movementName?: string;
    movementNumber?: number;
    name: string; // Required
    playParams?: PlayParameters;
    previews: Preview[]; // Required
    releaseDate: string; // Updated to string for YYYY-MM-DD or YYYY format
    trackNumber: number; // Required
    url: string; // Required
    workName?: string; // For classical music
  }  

  // https://developer.apple.com/documentation/applemusicapi/song/relationships
  export interface Relationships {
    albums?: AlbumRelationship; // The albums associated with the song (10 default, 10 max)
    artists?: ArtistRelationship; // The artists associated with the song (10 default, 10 max)
    composers?: ComposerRelationship; // New relationship: The composers for a catalog song
    genres?: GenreRelationship; // The genres associated with the song, not included by default
    library?: LibraryRelationship; // New relationship: Library song for a catalog song if added to the library
    'music-videos'?: MusicVideoRelationship; // New relationship: Music videos for a catalog song
    station?: StationRelationship; // The station associated with the song, not included by default
  }
}
