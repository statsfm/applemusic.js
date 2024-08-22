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
    const client = new HttpClient(configuration);

    this.albums = new CatalogManager<AlbumResponse>(client, 'albums');
    this.artists = new CatalogManager<ArtistResponse>(client, 'artists');
    this.musicVideos = new CatalogManager<MusicVideoResponse>(client, 'music-videos');
    this.playlists = new CatalogManager<PlaylistResponse>(client, 'playlists');
    this.songs = new CatalogManager<SongResponse>(client, 'songs');
    this.stations = new CatalogManager<StationResponse>(client, 'stations');
    this.search = new SearchManager<SearchResponse>(client);
    this.library = {
      songs: new LibraryManager<SongResponse>(client, 'songs'),
      playlists: new LibraryManager<PlaylistResponse>(client, 'playlists')
    };
  }
}
