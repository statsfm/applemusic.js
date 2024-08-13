import { ClientConfiguration } from './clientConfiguration';
import { ResourceClient } from './resourceClient/resourceClient';

import type { AlbumResponse } from './interfaces/AppleMusic/albumResponse';
import type { ArtistResponse } from './interfaces/AppleMusic/artistResponse';
import type { MusicVideoResponse } from './interfaces/AppleMusic/musicVideoResponse';
import type { PlaylistResponse } from './interfaces/AppleMusic/playlistResponse';
import type { SongResponse } from './interfaces/AppleMusic/songResponse';
import type { StationResponse } from './interfaces/AppleMusic/stationResponse';
import type { SearchResponse } from './interfaces/AppleMusic/searchResponse';
import CatalogUrl from './resourceClient/apiUrlBuilder/catalogUrl';
import LibraryUrl from './resourceClient/apiUrlBuilder/libraryUrl';
import SearchUrl from './resourceClient/apiUrlBuilder/searchUrl';

export class AppleMusicAPI {
  configuration: ClientConfiguration;

  albums: ResourceClient<AlbumResponse>;
  artists: ResourceClient<ArtistResponse>;
  musicVideos: ResourceClient<MusicVideoResponse>;
  playlists: ResourceClient<PlaylistResponse>;
  songs: ResourceClient<SongResponse>;
  stations: ResourceClient<StationResponse>;
  search: ResourceClient<SearchResponse>;
  library: {
    songs: ResourceClient<SongResponse>;
    playlists: ResourceClient<PlaylistResponse>;
  };

  constructor(configuration: ClientConfiguration) {
    this.configuration = configuration;

    this.albums = new ResourceClient<AlbumResponse>(new CatalogUrl('albums'), this.configuration);
    this.artists = new ResourceClient<ArtistResponse>(
      new CatalogUrl('artists'),
      this.configuration
    );
    this.musicVideos = new ResourceClient<MusicVideoResponse>(
      new CatalogUrl('music-videos'),
      this.configuration
    );
    this.playlists = new ResourceClient<PlaylistResponse>(
      new CatalogUrl('playlists'),
      this.configuration
    );
    this.songs = new ResourceClient<SongResponse>(new CatalogUrl('songs'), this.configuration);
    this.stations = new ResourceClient<StationResponse>(
      new CatalogUrl('stations'),
      this.configuration
    );
    this.search = new ResourceClient<SearchResponse>(new SearchUrl(), this.configuration);

    this.library = {
      songs: new ResourceClient<SongResponse>(new LibraryUrl('songs'), this.configuration),
      playlists: new ResourceClient<PlaylistResponse>(
        new LibraryUrl('playlists'),
        this.configuration
      )
    };
  }
}
