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
    editorialNotes?: EditorialNotes;
    genreNames: string[];
    name: string;
    url: string;
    artwork?: Artwork;
  }

  // https://developer.apple.com/documentation/applemusicapi/artist/relationships
  export interface Relationships {
    albums?: AlbumRelationship;
    genres?: GenreRelationship;
    musicVideos?: MusicVideoRelationship;
    playlists?: PlaylistRelationship;
    station?: StationRelationship;
  }
}
