import { Relationship } from './relationship';
import { Song } from './song';

export interface SongRelationship extends Relationship {
  data: Song[];
}
