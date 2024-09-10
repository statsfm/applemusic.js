// https://developer.apple.com/documentation/applemusicapi/artwork
export interface Artwork {
  bgColor?: string; // The average background color of the image
  height: number; // Required: The maximum height available for the image
  width: number; // Required: The maximum width available for the image
  textColor1?: string; // The primary text color used if the background color is displayed
  textColor2?: string; // The secondary text color used if the background color is displayed
  textColor3?: string; // The tertiary text color used if the background color is displayed
  textColor4?: string; // The final post-tertiary text color used if the background color is displayed
  url: string; // Required: The URL to request the image asset. Must include {w}x{h} as placeholders for width and height.
}
