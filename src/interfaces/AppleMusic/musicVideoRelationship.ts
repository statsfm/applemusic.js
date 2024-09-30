import { Relationship } from './relationship';
import { MusicVideo } from './musicVideo'; // Use the existing MusicVideo interface

export interface MusicVideoRelationship extends Relationship {
  data: MusicVideo[];
}
