import os from 'os';
import process from 'process';

import { AppleMusicAPI } from './AppleMusicAPI';
import { AppleMusicError } from './AppleMusicError';
import { ClientConfiguration } from './interfaces/Config';
import { BadRequestError, UnauthorizedError } from './errors';

const { APPLE_MUSIC_DEVELOPER_TOKEN: developerToken } = process.env;
if (!developerToken) {
  throw new Error('Environemnt variable "APPLE_MUSIC_DEVELOPER_TOKEN" is required');
}

// TODO: apple music api requests mocking
describe('AppleMusicAPI', () => {
  let client: AppleMusicAPI;

  const baseConfig: ClientConfiguration = {
    developerToken
  };

  beforeEach(() => {
    client = new AppleMusicAPI(baseConfig);
  });

  it('handles authorization errors', async () => {
    client = new AppleMusicAPI({
      developerToken: 'invalid'
    });

    // For some reason it doesn't return error response
    // if the same playlist is requested in other test cases (maybe caching?).
    await expect(
      client.playlists.get('pl.7d657a836db14d768accd2e6ffd1b0ad', { storefront: 'jp' })
    ).rejects.toThrow(UnauthorizedError);
  });

  it('handles bad request errors', async () => {
    await expect(
      client.playlists.get('pl.5ee8333dbe944d9f9151e97d92d1ead9', { storefront: 'foo' })
    ).rejects.toThrow(BadRequestError);
  });

  it('handles Playlist.Attributes.lastModifiedDate as Date object', async () => {
    // https://music.apple.com/jp/playlist/a-list-pop/pl.5ee8333dbe944d9f9151e97d92d1ead9?l=en
    const res = await client.playlists.get('pl.5ee8333dbe944d9f9151e97d92d1ead9', {
      storefront: 'jp'
    });

    const [playlist] = res.data;
    expect(playlist.attributes!.lastModifiedDate.getFullYear()).toBeGreaterThanOrEqual(2020);
  });

  it('handles Album.Attributes.releaseDate as CalendarDate object', async () => {
    // https://music.apple.com/jp/album/a-brief-inquiry-into-online-relationships/1435546528?l=en
    const response = await client.albums.get('1435546528', { storefront: 'jp' });

    const [album] = response.data;

    const releaseDate = album.attributes!.releaseDate;
    expect(releaseDate?.year).toEqual(2018);
    expect(releaseDate?.month).toEqual(11);
    expect(releaseDate?.day).toEqual(30);
    expect(releaseDate?.toUTCDate().getFullYear()).toEqual(2018);
  });

  it('supports language tags', async () => {
    const id = 'pl.5ee8333dbe944d9f9151e97d92d1ead9';

    const res = await client.playlists.get(id, { storefront: 'jp' });

    const [playlist] = res.data;
    expect(playlist.attributes!.name).toEqual('Ａリスト：ポップ');

    const resEn = await client.playlists.get(id, {
      storefront: 'jp',
      languageTag: 'en-US'
    });

    const [playlistEn] = resEn.data;
    expect(playlistEn.attributes!.name).toEqual('A-List Pop');
  });
});
