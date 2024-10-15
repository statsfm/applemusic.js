import { Relationship } from './relationship';
import { Song } from './song'; // Assuming this refers to the library song, modeled like a song

export interface LibraryRelationship extends Relationship {
  data: Song[]; // Update to correct type if not a song
}
