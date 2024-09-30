import { ClientConfiguration } from './interfaces/Config';

import type { AlbumResponse } from './interfaces/AppleMusic/albumResponse';
import type { ArtistResponse } from './interfaces/AppleMusic/artistResponse';
import type { MusicVideoResponse } from './interfaces/AppleMusic/musicVideoResponse';
import type { PlaylistResponse } from './interfaces/AppleMusic/playlistResponse';
import type { SongResponse } from './interfaces/AppleMusic/songResponse';
import type { StationResponse } from './interfaces/AppleMusic/stationResponse';
import type { SearchResponse } from './interfaces/AppleMusic/searchResponse';

import { HttpClient } from './http/HttpClient';
import { CatalogManager } from './catalog/CatalogManager';
import { SearchManager } from './search/SearchManager';
import { LibraryManager } from './library/LibraryManager';

export class AppleMusicAPI {
  _client: HttpClient;
  albums: CatalogManager<AlbumResponse>;
  artists: CatalogManager<ArtistResponse>;
  musicVideos: CatalogManager<MusicVideoResponse>;
  playlists: CatalogManager<PlaylistResponse>;
  songs: CatalogManager<SongResponse>;
  stations: CatalogManager<StationResponse>;
  search: SearchManager<SearchResponse>;
  library: {
    songs: LibraryManager<SongResponse>;
    playlists: LibraryManager<PlaylistResponse>;
  };

  constructor(public configuration: Readonly<ClientConfiguration>) {
    this._client = new HttpClient(configuration);

    this.albums = new CatalogManager<AlbumResponse>(this._client, 'albums');
    this.artists = new CatalogManager<ArtistResponse>(this._client, 'artists');
    this.musicVideos = new CatalogManager<MusicVideoResponse>(this._client, 'music-videos');
    this.playlists = new CatalogManager<PlaylistResponse>(this._client, 'playlists');
    this.songs = new CatalogManager<SongResponse>(this._client, 'songs');
    this.stations = new CatalogManager<StationResponse>(this._client, 'stations');
    this.search = new SearchManager<SearchResponse>(this._client);
    this.library = {
      songs: new LibraryManager<SongResponse>(this._client, 'songs'),
      playlists: new LibraryManager<PlaylistResponse>(this._client, 'playlists')
    };
  }
}
