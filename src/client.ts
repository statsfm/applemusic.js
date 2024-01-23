import { ClientConfiguration } from './clientConfiguration';
import { ResourceClient } from './resourceClient/resourceClient';

import { AlbumResponse } from './serverTypes/albumResponse';
import { ArtistResponse } from './serverTypes/artistResponse';
import { MusicVideoResponse } from './serverTypes/musicVideoResponse';
import { PlaylistResponse } from './serverTypes/playlistResponse';
import { SongResponse } from './serverTypes/songResponse';
import { StationResponse } from './serverTypes/stationResponse';
import { SearchResponse } from './serverTypes/searchResponse';
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
    this.artists = new ResourceClient<ArtistResponse>(new CatalogUrl('artists'), this.configuration);
    this.musicVideos = new ResourceClient<MusicVideoResponse>(new CatalogUrl('music-videos'), this.configuration);
    this.playlists = new ResourceClient<PlaylistResponse>(new CatalogUrl('playlists'), this.configuration);
    this.songs = new ResourceClient<SongResponse>(new CatalogUrl('songs'), this.configuration);
    this.stations = new ResourceClient<StationResponse>(new CatalogUrl('stations'), this.configuration);
    this.search = new ResourceClient<SearchResponse>(new SearchUrl(), this.configuration);

    this.library = {
      songs: new ResourceClient<SongResponse>(new LibraryUrl('songs'), this.configuration),
      playlists: new ResourceClient<PlaylistResponse>(new LibraryUrl('playlists'), this.configuration)
    };
  }
}
