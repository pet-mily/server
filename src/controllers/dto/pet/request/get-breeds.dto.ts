import { IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetBreedsDto {
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(['DOG', 'CAT'])
  readonly type: 'DOG' | 'CAT';
}
