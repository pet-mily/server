import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { signup } from '../helpers';

describe('PUT /pets/:petId - 반려동물 정보 수정', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    prisma = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);

    await app.init();

    jest.spyOn(authService, 'getKakaoProfile').mockResolvedValue({
      id: 'test-id',
    });
  });

  afterEach(async () => {
    await prisma.pet.deleteMany();
    await prisma.user.deleteMany();
  });

  it('204를 반환하며 반려동물의 정보를 수정한다', async () => {
    // given
    const { accessToken } = await signup(app);
    const user = await prisma.user.findFirst();
    const pet = await prisma.pet.create({
      data: {
        ownerId: user!.id,
        type: 'DOG',
        name: '멍멍이',
        gender: 'MALE',
        breed: '골대더',
        weight: 5.5,
        neutered: true,
        birthday: new Date('2021-01-01'),
        rabiesVaccinationDate: null,
        comprehensiveVaccinationDate: null,
        covidVaccinationDate: null,
        kennelCoughVaccinationDate: null,
        heartwormVaccinationDate: null,
        externalParasiteVaccination: null,
        description: '테스트용 멍멍이',
        image: 'https://test.com/image1.jpg',
      },
    });

    // when
    const response = await request(app.getHttpServer())
      .put(`/pets/${pet.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        type: 'DOG',
        name: '바뀐이름',
        gender: 'MALE',
        breed: 'null',
        birthday: '2021-01-02',
        weight: 5.5,
        neutered: true,
        rabiesVaccinationDate: null,
        comprehensiveVaccinationDate: null,
        covidVaccinationDate: null,
        kennelCoughVaccinationDate: null,
        heartwormVaccinationDate: null,
        externalParasiteVaccination: null,
        description: '바뀐 설명',
      });

    // then
    expect(response.status).toBe(204);
    const updatedPet = await prisma.pet.findFirst({
      where: { id: pet.id },
    });
    expect(updatedPet).toEqual({
      id: pet.id,
      ownerId: user!.id,
      type: 'DOG',
      name: '바뀐이름',
      gender: 'MALE',
      breed: null,
      birthday: new Date('2021-01-02'),
      weight: 5.5,
      neutered: true,
      rabiesVaccinationDate: null,
      comprehensiveVaccinationDate: null,
      covidVaccinationDate: null,
      kennelCoughVaccinationDate: null,
      heartwormVaccinationDate: null,
      externalParasiteVaccination: null,
      description: '바뀐 설명',
      image: 'https://test.com/image1.jpg',
    });
  });
});
