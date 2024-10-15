import { Relationship } from './relationship';
import { Artist } from './artist'; // Assuming composers are modeled like artists, you can change this if needed

export interface ComposerRelationship extends Relationship {
  data: Artist[]; // Assuming composers are part of the `Artist` interface, otherwise update this to the correct type
}
