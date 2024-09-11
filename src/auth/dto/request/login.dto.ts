import { IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(['KAKAO', 'NAVER'])
  readonly provider: 'KAKAO' | 'NAVER';

  @IsString()
  readonly providerAccessToken: string;
}
