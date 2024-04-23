import { AxiosProxyConfig } from 'axios';

export interface ClientConfiguration {
  developerToken: string;
  mediaUserToken?: string;
  defaultStorefront?: string;
  defaultLanguageTag?: string;

  /**
   * Retry request when ratelimit is hit.
   */
  retry?: boolean;
  /**
   * Log retries.
   */
  logRetry?: boolean;
  /**
   * Retry request if the response code is in the 500 range. Default: true
   */
  retry5xx?: boolean;
  /**
   * Amount of retries. Default: 3
   */
  retry5xxAmount?: number;
  /**
   * HTTP options.
   */
  http?: {
    /**
     * HTTP proxy config.
     */
    proxy?: AxiosProxyConfig;
    /**
     * Set a custom user agent.
     */
    userAgent?: string;
    /**
     * Change the default outbind IP (can be IPV6 or IPV4).
     */
    localAddress?: string;
    /**
     * Set headers to be sent with every request.
     */
    headers?: Record<string, string>;
    /**
     * Base URL for the API. Default: "https://api.music.apple.com".
     */
    baseURL?: string;
  };
  /**
   * Enable debug mode.
   */
  debug?: boolean;
}
