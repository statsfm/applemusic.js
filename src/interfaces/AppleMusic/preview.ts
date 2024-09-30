import { Artwork } from './artwork';

// https://developer.apple.com/documentation/applemusicapi/preview
export interface Preview {
  artwork?: Artwork; // Optional: The preview artwork for the associated preview music video
  url: string; // Required: The preview URL for the content
  hlsUrl?: string; // Optional: The HLS preview URL for the content
}
