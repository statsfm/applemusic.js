import { Relationship } from './relationship';
import { RecordLabel } from './recordLabel';

export interface RecordLabelRelationship extends Relationship {
  data: RecordLabel[];
}
