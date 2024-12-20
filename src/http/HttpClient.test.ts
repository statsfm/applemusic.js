import nock from 'nock';

import { ClientConfiguration } from '../interfaces/Config';
import { HttpClient } from './HttpClient';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  RatelimitError,
  RequestRetriesExceededError,
  UnauthorizedError
} from '../errors';

nock.disableNetConnect();

describe.only('HttpClient', () => {
  const baseConfig: ClientConfiguration = {
    retry: false,
    retry5xx: false,
    developerToken: 'devToken'
  };

  beforeEach(() => {
    nock.cleanAll();
  });

  describe('urls', () => {
    const client = new HttpClient(baseConfig);

    it('should return correct URL with pathname and query parameters', () => {
      const pathname = '/v1/catalog/us/songs';
      const query = new URLSearchParams({ ids: '12345' });
      const expectedURL = 'https://api.music.apple.com/v1/catalog/us/songs?ids=12345';

      expect(client.getURL(pathname, query)).toBe(expectedURL);
    });

    it('should return correct URL with empty query parameters', () => {
      const pathname = '/v1/catalog/us/songs';
      const query = new URLSearchParams();
      const expectedURL = 'https://api.music.apple.com/v1/catalog/us/songs';

      expect(client.getURL(pathname, query)).toBe(expectedURL);
    });

    it('should return base URL with empty pathname and query parameters', () => {
      const pathname = '';
      const query = new URLSearchParams();
      const expectedURL = 'https://api.music.apple.com/';

      expect(client.getURL(pathname, query)).toBe(expectedURL);
    });
  });

  describe('errors', () => {
    const client = new HttpClient(baseConfig);

    it('should throw UnauthorizedError when status code is 401', async () => {
      nock('https://api.music.apple.com').get('/v1/catalog/us/songs').reply(401, 'Unauthorized');

      await expect(client.get('https://api.music.apple.com/v1/catalog/us/songs')).rejects.toThrow(
        UnauthorizedError
      );
    });

    it('should throw BadRequestError when status code is 400', async () => {
      nock('https://api.music.apple.com').get('/v1/catalog/us/songs').reply(400, 'Bad request');

      await expect(client.get('https://api.music.apple.com/v1/catalog/us/songs')).rejects.toThrow(
        BadRequestError
      );
    });

    it('should throw ForbiddenError when status code is 403', async () => {
      nock('https://api.music.apple.com').get('/v1/catalog/us/songs').reply(403, 'Forbidden');

      await expect(client.get('https://api.music.apple.com/v1/catalog/us/songs')).rejects.toThrow(
        ForbiddenError
      );
    });

    it('should throw NotFoundError when status code is 404', async () => {
      nock('https://api.music.apple.com').get('/v1/catalog/us/songs').reply(404, 'Not Found');

      await expect(client.get('https://api.music.apple.com/v1/catalog/us/songs')).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw RatelimitError when status code is 429', async () => {
      nock('https://api.music.apple.com').get('/v1/catalog/us/songs').reply(429, 'Rate limited', {
        'Retry-After': '1'
      });

      await expect(client.get('https://api.music.apple.com/v1/catalog/us/songs')).rejects.toThrow(
        RatelimitError
      );
    });

    it('should passthrough server errors', async () => {
      nock('https://api.music.apple.com').get('/v1/catalog/us/songs').reply(500, 'Server error');

      await expect(client.get('https://api.music.apple.com/v1/catalog/us/songs')).rejects.toThrow(
        'Request failed with status code 500'
      );
    });

    it('should throw error for network errors', async () => {
      nock('https://api.music.apple.com')
        .get('/v1/catalog/us/songs')
        .replyWithError('Network error');

      await expect(client.get('https://api.music.apple.com/v1/catalog/us/songs')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('retries', () => {
    const client = new HttpClient({
      ...baseConfig,
      retry: true,
      retry5xx: true,
      retry5xxAmount: 1,
      logRetry: true
    });

    it('should retry rate limited requests', async () => {
      nock('https://api.music.apple.com').get('/v1/catalog/us/songs').reply(429, 'Rate limited', {
        'Retry-After': '1'
      });

      await expect(client.get('https://api.music.apple.com/v1/catalog/us/songs')).rejects.toThrow(
        RequestRetriesExceededError
      );
    });

    it('should retry server error status codes', async () => {
      nock('https://api.music.apple.com').get('/v1/catalog/us/songs').reply(500, 'Server error');

      await expect(client.get('https://api.music.apple.com/v1/catalog/us/songs')).rejects.toThrow(
        RequestRetriesExceededError
      );
    });

    it('should not retry when response is success', async () => {
      nock('https://api.music.apple.com').get('/v1/catalog/us/songs').reply(404, 'Not Found');

      const client = new HttpClient({
        ...baseConfig,
        retry: true,
        retry5xx: true,
        retry5xxAmount: 2,
        logRetry: true
      });

      await expect(client.get('https://api.music.apple.com/v1/catalog/us/songs')).rejects.toThrow(
        NotFoundError
      );
    });

    it('should not retry when retry attempts is zero', async () => {
      nock('https://api.music.apple.com').get('/v1/catalog/us/songs').reply(429, 'Rate limited', {
        'Retry-After': '1'
      });

      const client = new HttpClient({
        ...baseConfig,
        retry: true,
        retry5xx: true,
        retry5xxAmount: 0,
        logRetry: true
      });

      await expect(client.get('https://api.music.apple.com/v1/catalog/us/songs')).rejects.toThrow(
        RatelimitError
      );
    });
  });

  describe('success', () => {
    it('should return response data in case of successfull response', async () => {
      nock('https://api.music.apple.com').get('/v1/catalog/us/songs').reply(200, { root: 'value' });

      const client = new HttpClient(baseConfig);
      const response = await client.get('https://api.music.apple.com/v1/catalog/us/songs');

      expect(response.data).toEqual({
        root: 'value'
      });
    });
  });
});
