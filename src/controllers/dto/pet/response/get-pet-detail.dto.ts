import { ApiProperty } from '@nestjs/swagger';

export class GetPetDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['CAT', 'DOG'] })
  type: string;

  @ApiProperty()
  breed: string;

  @ApiProperty()
  birthday: Date;

  @ApiProperty({ description: '심장사상충 접종 여부 - true or false' })
  heartwormPrevention: boolean;

  @ApiProperty()
  description: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  ownerId: string;
}
