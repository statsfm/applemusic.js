import { Resource } from './resource';
import { Artwork } from './artwork';
import { EditorialNotes } from './editorialNotes';
import { PlayParameters } from './playParameters';

// https://developer.apple.com/documentation/applemusicapi/station
export interface Station extends Resource {
  attributes?: Station.Attributes;
  type: 'stations';
}

namespace Station {
  // https://developer.apple.com/documentation/applemusicapi/station/attributes
  export interface Attributes {
    artwork: Artwork; // Required
    contentRating?: string; // New field, possible values: 'clean', 'explicit'
    durationInMillis?: number;
    editorialNotes?: EditorialNotes;
    episodeNumber?: string; // Updated to string
    isLive: boolean; // Required
    mediaKind: 'audio' | 'video'; // New field, required
    name: string; // Required
    playParams?: PlayParameters; // Optional, supported by API
    stationProviderName?: string; // New field
    url: string; // Required
  }
}
