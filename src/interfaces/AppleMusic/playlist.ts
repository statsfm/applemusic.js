import { Resource } from './resource';
import { Artwork } from './artwork';
import { EditorialNotes } from './editorialNotes';
import { PlayParameters } from './playParameters';
import { CuratorRelationship } from './curatorRelationship';
import { TrackRelationship } from './trackRelationship';
import { LibraryRelationship } from './libraryRelationship';

// https://developer.apple.com/documentation/applemusicapi/playlist
export interface Playlist extends Resource {
  attributes?: Playlist.Attributes;
  relationships?: Playlist.Relationships;
  type: 'playlists';
}

namespace Playlist {
  // https://developer.apple.com/documentation/applemusicapi/playlist/attributes
  export interface Attributes {
    artwork?: Artwork;
    curatorName: string; // Required
    description?: EditorialNotes;
    isChart: boolean; // New field, required
    lastModifiedDate: string; // Updated to string for date format
    name: string; // Required
    playParams?: PlayParameters;
    playlistType: 'user-shared' | 'editorial' | 'external' | 'personal-mix' | 'replay'; // Added 'replay'
    url: string; // Required
    trackTypes?: string[]; // New field, with possible values 'music-videos', 'songs'
  }
  

  // https://developer.apple.com/documentation/applemusicapi/playlist/relationships
  export interface Relationships {
    curator?: CuratorRelationship; // The curator that created the playlist, includes identifiers only
    library?: LibraryRelationship; // Library playlist for a catalog playlist if added to library
    tracks?: TrackRelationship; // The songs and music videos included in the playlist (100 default, 300 max)
  }
}
