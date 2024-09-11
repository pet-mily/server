import { IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ enum: ['KAKAO', 'NAVER'] })
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(['KAKAO', 'NAVER'])
  readonly provider: 'KAKAO' | 'NAVER';

  @ApiProperty()
  @IsString()
  readonly providerAccessToken: string;
}
