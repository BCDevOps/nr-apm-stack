import { IntentionActionPointerRestDto } from './intention-action-pointer-rest.dto';
import { VertexPointerRestDto } from './vertex-pointer-rest.dto';

// Shared DTO: Copy in back-end and front-end should be identical
export class ServiceInstanceRestDto extends VertexPointerRestDto {
  id!: string;
  name!: string;
  url?: string;
  action?: IntentionActionPointerRestDto;
  actionHistory?: IntentionActionPointerRestDto[];
}
