import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsDate,
  IsBoolean,
} from 'class-validator';

export class UpdatePetDto {
  @ApiProperty({ enum: ['DOG', 'CAT'] })
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(['DOG', 'CAT'])
  readonly type: 'DOG' | 'CAT';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({ description: '품종' })
  @IsString()
  @IsNotEmpty()
  readonly breed: string;

  @ApiProperty({ description: '생일 YYYY-MM-DD', example: '2021-01-01' })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  birthday: Date;

  @ApiProperty({ description: '심장사상충 접종 여부 - true or false' })
  @Transform(({ obj, key }) => {
    return obj[key] === 'true' ? true : obj[key] === 'false' ? false : obj[key];
  })
  @IsBoolean()
  heartwormPrevention: boolean;

  @ApiProperty({ description: '펫 설명, 공백으로 주셔도 됩니다' })
  @IsString()
  description: string;
}
