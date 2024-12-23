import { Error } from '../interfaces/AppleMusic/error';

/* eslint-disable no-unused-vars */
class HttpError extends Error {
  constructor(
    public readonly url: string,
    public readonly status: number,
    public readonly message: string
  ) {
    super(message);
  }
}

export class UnauthorizedError extends HttpError {
  name = UnauthorizedError.name;

  constructor(url: string) {
    super(url, 401, 'Unauthorized');
  }
}

export class ForbiddenError extends HttpError {
  name = ForbiddenError.name;

  constructor(url: string) {
    super(url, 403, 'Forbidden, are you sure you have the right scopes?');
  }
}

export class NotFoundError extends HttpError {
  name = NotFoundError.name;

  constructor(url: string) {
    super(url, 404, 'Not Found');
  }
}

export class RatelimitError extends HttpError {
  name = RatelimitError.name;

  constructor(url: string, retryDelay: string) {
    super(url, 429, `Hit ratelimit, retry after ${retryDelay} seconds`);
  }
}

export class BadRequestError extends HttpError {
  name = BadRequestError.name;

  constructor(
    url: string,
    public errors: Error[]
  ) {
    super(url, 400, 'Bad Request');
  }
}

export class RequestRetriesExceededError extends Error {
  name = RequestRetriesExceededError.name;

  constructor(
    public readonly message: string,
    public readonly url: string,
    public readonly cause: unknown
  ) {
    super(message);
  }
}
