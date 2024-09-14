import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsDate,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

import {
  IsNullableString,
  IsNullableDate,
  TransformNullableString,
  TransformNullableDate,
} from '../../helpers';

export class CreatePetDto {
  @ApiProperty({ enum: ['DOG', 'CAT'] })
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(['DOG', 'CAT'], {
    message: 'type must be DOG or CAT',
  })
  readonly type: 'DOG' | 'CAT';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({ enum: ['MALE', 'FEMAIL'] })
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(['MALE', 'FEMAIL'], {
    message: 'gender must be MALE or FEMAIL',
  })
  readonly gender: 'MALE' | 'FEMAIL';

  @ApiProperty({
    description: '품종 - 모르겠음 일때는 null 로 보내주세요',
    nullable: true,
  })
  @TransformNullableString()
  @IsNullableString()
  readonly breed: string | null;

  @ApiProperty({ description: '생일 YYYY-MM-DD' })
  @IsDate()
  birthday: Date;

  @ApiProperty({ description: '몸무게 - Int, Float 다 가능' })
  @IsNumber()
  weight: number;

  @ApiProperty({ description: '중성화 여부 - true or false' })
  @Transform(({ obj, key }) => {
    return obj[key] === 'true' ? true : obj[key] === 'false' ? false : obj[key];
  })
  @IsBoolean()
  neutered: boolean;

  @ApiProperty({
    description: '광견병 예방접종 일자 YYYY-MM-DD',
    nullable: true,
  })
  @TransformNullableDate()
  @IsNullableDate()
  rabiesVaccinationDate: Date | null;

  @ApiProperty({
    description: '종합백신 예방접종 일자 YYYY-MM-DD',
    nullable: true,
  })
  @TransformNullableDate()
  @IsNullableDate()
  comprehensiveVaccinationDate: Date | null;

  @ApiProperty({
    description: '코로나 예방접종 일자 YYYY-MM-DD',
    nullable: true,
  })
  @TransformNullableDate()
  @IsNullableDate()
  covidVaccinationDate: Date | null;

  @ApiProperty({
    description: '켄넬코프 예방접종 일자 YYYY-MM-DD',
    nullable: true,
  })
  @TransformNullableDate()
  @IsNullableDate()
  kennelCoughVaccinationDate: Date | null;

  @ApiProperty({
    description: '심장사상충 예방접종 일자 YYYY-MM-DD',
    nullable: true,
  })
  @TransformNullableDate()
  @IsNullableDate()
  heartwormVaccinationDate: Date | null;

  @ApiProperty({
    description: '외부기생충 예방접종 일자 YYYY-MM-DD',
    nullable: true,
  })
  @TransformNullableDate()
  @IsNullableDate()
  externalParasiteVaccination: Date | null;

  @ApiProperty({ description: '펫 설명, 공백으로 주셔도 됩니다' })
  @IsString()
  description: string;

  @ApiProperty({ description: '펫 이미지 파일' })
  image: Express.Multer.File;
}
