import { ApiProperty } from '@nestjs/swagger';

export class GetPetDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['CAT', 'DOG'] })
  type: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['MALE', 'FEMALE'] })
  gender: string;

  @ApiProperty({ description: '품종', nullable: true })
  breed: string | null;

  @ApiProperty({ description: '생일 YYYY-MM-DD', example: '2021-01-01' })
  birthday: string;

  @ApiProperty({ description: '몸무게' })
  weight: number;

  @ApiProperty({ description: '중성화 여부 - true or false' })
  neutered: boolean;

  @ApiProperty({
    description: '광견병 예방접종 일자 YYYY-MM-DD',
    nullable: true,
  })
  rabiesVaccinationDate: string | null;

  @ApiProperty({
    description: '종합백신 예방접종 일자 YYYY-MM-DD',
    nullable: true,
  })
  comprehensiveVaccinationDate: string | null;

  @ApiProperty({
    description: '코로나 예방접종 일자 YYYY-MM-DD',
    nullable: true,
  })
  covidVaccinationDate: string | null;

  @ApiProperty({
    description: '켄넬코프 예방접종 일자 YYYY-MM-DD',
    nullable: true,
  })
  kennelCoughVaccinationDate: string | null;

  @ApiProperty({
    description: '심장사상충 예방접종 일자 YYYY-MM-DD',
    nullable: true,
  })
  heartwormVaccinationDate: string | null;

  @ApiProperty({
    description: '외부기생충 예방접종 일자 YYYY-MM-DD',
    nullable: true,
  })
  externalParasiteVaccination: string | null;

  @ApiProperty()
  description: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  ownerId: string;
}
