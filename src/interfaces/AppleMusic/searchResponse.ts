import { AlbumResponse } from './albumResponse';
import { ArtistResponse } from './artistResponse';
import { MusicVideoResponse } from './musicVideoResponse';
import { PlaylistResponse } from './playlistResponse';
import { ResponseRoot } from './responseRoot';
import { SongResponse } from './songResponse';

// https://developer.apple.com/documentation/applemusicapi/searchresponse
export interface SearchResponse extends ResponseRoot {
  results: {
    activities?: unknown; // You can define a specific type if needed
    albums?: AlbumResponse;
    'apple-curators'?: unknown; // You can define a specific type if needed
    artists?: ArtistResponse;
    curators?: unknown; // You can define a specific type if needed
    'music-videos'?: MusicVideoResponse;
    playlists?: PlaylistResponse;
    'record-labels'?: unknown; // You can define a specific type if needed
    songs?: SongResponse;
    stations?: unknown; // You can define a specific type if needed
    top?: unknown; // You can define a specific type if needed
  };
}
