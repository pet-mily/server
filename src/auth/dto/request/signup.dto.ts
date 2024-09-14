import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ enum: ['KAKAO', 'NAVER'] })
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(['KAKAO', 'NAVER'])
  readonly provider: 'KAKAO' | 'NAVER';

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly providerAccessToken: string;

  @ApiProperty({ description: '닉네임' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly phoneNumber: string;
}
