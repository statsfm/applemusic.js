import type { ResponseRoot } from './interfaces/AppleMusic/responseRoot';

export class AppleMusicError extends Error {
  constructor(
    message: string,
    // eslint-disable-next-line no-unused-vars
    public httpStatusCode: number,
    // eslint-disable-next-line no-unused-vars
    public response?: ResponseRoot
  ) {
    super(message);
  }
}
