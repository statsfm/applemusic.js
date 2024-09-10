import { Resource } from './resource';
import { EditorialNotes } from './editorialNotes';
import { AlbumRelationship } from './albumRelationship';
import { GenreRelationship } from './genreRelationship';
import { MusicVideoRelationship } from './musicVideoRelationship';
import { PlaylistRelationship } from './playlistRelationship';
import { StationRelationship } from './stationRelationship';
import { Artwork } from './artwork';

// https://developer.apple.com/documentation/applemusicapi/artist
export interface Artist extends Resource {
  attributes?: Artist.Attributes;
  relationships?: Artist.Relationships;
  type: 'artists';
}

namespace Artist {
  // https://developer.apple.com/documentation/applemusicapi/artist/attributes
  export interface Attributes {
    artwork?: Artwork; // New field
    editorialNotes?: EditorialNotes;
    genreNames: string[];
    name: string;
    url: string;
  }
  
  // https://developer.apple.com/documentation/applemusicapi/artist/relationships
  export interface Relationships {
    albums?: AlbumRelationship; // The albums associated with the artist (25 default, 100 max)
    genres?: GenreRelationship; // The genres associated with the artist, not included by default
    'music-videos'?: MusicVideoRelationship; // The music videos associated with the artist (25 default, 100 max)
    playlists?: PlaylistRelationship; // The playlists associated with the artist (10 default, 10 max)
    station?: StationRelationship; // The station associated with the artist, not included by default (one station)
  }  
}
