import { ApiProperty } from '@nestjs/swagger';

export class UpdatePetImageDto {
  @ApiProperty({
    format: 'binary',
    description: '반려동물 이미지',
  })
  image: Express.Multer.File;
}
