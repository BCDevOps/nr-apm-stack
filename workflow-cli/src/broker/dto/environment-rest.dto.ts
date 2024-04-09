import { VertexPointerRestDto } from './vertex-pointer-rest.dto';

// Shared DTO: Copy in back-end and front-end should be identical

export class EnvironmentRestDto extends VertexPointerRestDto {
  id!: string;
  name!: string;
  short!: string;
  aliases!: string[];
  title!: string;
  position!: number;
}
