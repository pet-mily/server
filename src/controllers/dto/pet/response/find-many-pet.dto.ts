import { ApiProperty } from '@nestjs/swagger';

export class FindManyPetDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['CAT', 'DOG'] })
  type: string;

  @ApiProperty({ description: '반려동물 이미지 URL' })
  image: string;
}
