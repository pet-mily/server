import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsNullableString } from '../../helpers';

export class UpdateUserDto {
  @ApiProperty({ description: '닉네임' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @ApiProperty({
    description: '도로명 주소',
    nullable: true,
    type: String,
    example: '가야대로 255번길 5',
  })
  @IsNullableString()
  readonly address: string | null;

  @ApiProperty({
    description: '상세 주소',
    nullable: true,
    type: String,
    example: '101동 101호',
  })
  @IsNullableString()
  readonly detailAddress: string | null;
}
