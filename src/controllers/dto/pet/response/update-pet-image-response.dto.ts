import { ApiProperty } from '@nestjs/swagger';

export class UpdatePetImageResponseDto {
  @ApiProperty()
  image: string;
}
