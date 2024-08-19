import { ClientConfiguration } from './interfaces/Config';

import type { AlbumResponse } from './interfaces/AppleMusic/albumResponse';
import type { ArtistResponse } from './interfaces/AppleMusic/artistResponse';
import type { MusicVideoResponse } from './interfaces/AppleMusic/musicVideoResponse';
import type { PlaylistResponse } from './interfaces/AppleMusic/playlistResponse';
import type { SongResponse } from './interfaces/AppleMusic/songResponse';
import type { StationResponse } from './interfaces/AppleMusic/stationResponse';
import type { SearchResponse } from './interfaces/AppleMusic/searchResponse';
import { SearchURLBuilder } from './urls/SearchURLBuilder';
import { CatalogURLBuilder } from './urls/CatalogURLBuilder';
import { LibraryURLBuilder } from './urls/LibraryURLBuilder';
import { HttpClient } from './http/HttpClient';
import { Manager } from './Manager';

export class AppleMusicAPI {
  albums: Manager<AlbumResponse>;
  artists: Manager<ArtistResponse>;
  musicVideos: Manager<MusicVideoResponse>;
  playlists: Manager<PlaylistResponse>;
  songs: Manager<SongResponse>;
  stations: Manager<StationResponse>;
  search: Manager<SearchResponse>;
  library: {
    songs: Manager<SongResponse>;
    playlists: Manager<PlaylistResponse>;
  };

  constructor(public configuration: Readonly<ClientConfiguration>) {
    const client = new HttpClient(configuration);

    this.albums = new Manager<AlbumResponse>(new CatalogURLBuilder('albums'), client);
    this.artists = new Manager<ArtistResponse>(new CatalogURLBuilder('artists'), client);
    this.musicVideos = new Manager<MusicVideoResponse>(
      new CatalogURLBuilder('music-videos'),
      client
    );
    this.playlists = new Manager<PlaylistResponse>(new CatalogURLBuilder('playlists'), client);
    this.songs = new Manager<SongResponse>(new CatalogURLBuilder('songs'), client);
    this.stations = new Manager<StationResponse>(new CatalogURLBuilder('stations'), client);
    this.search = new Manager<SearchResponse>(new SearchURLBuilder(), client);

    this.library = {
      songs: new Manager<SongResponse>(new LibraryURLBuilder('songs'), client),
      playlists: new Manager<PlaylistResponse>(new LibraryURLBuilder('playlists'), client)
    };
  }
}
