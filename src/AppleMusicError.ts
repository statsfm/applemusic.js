/* eslint-disable no-unused-vars */
import type { ResponseRoot } from './interfaces/AppleMusic/responseRoot';

export class AppleMusicError extends Error {
  constructor(
    message: string,
    public httpStatusCode: number,
    public response?: ResponseRoot
  ) {
    super(message);
  }
}
