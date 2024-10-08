import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { PetService } from 'src/providers/pet.service';
import { signup } from '../helpers';
import * as fs from 'fs';
import * as path from 'path';
import {
  S3Client,
  HeadObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

describe('POST /pets - 반려동물 등록', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let petService: PetService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    prisma = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);
    petService = module.get<PetService>(PetService);

    await app.init();

    jest.spyOn(authService, 'getKakaoProfile').mockResolvedValue({
      id: 'test-id',
    });
  });

  afterEach(async () => {
    await prisma.pet.deleteMany();
    await prisma.user.deleteMany();
  });

  it('type이 DOG나 CAT이 아닐때 400을 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath)
      .field('type', 'INVALID')
      .field('name', '멍멍이')
      .field('gender', 'male')
      .field('breed', '골대더')
      .field('birthday', '2021-01-01')
      .field('weight', '5')
      .field('neutered', true)
      .field('rabiesVaccinationDate', '2021-01-01')
      .field('comprehensiveVaccinationDate', '2021-01-01')
      .field('covidVaccinationDate', '2021-01-01')
      .field('kennelCoughVaccinationDate', '2021-01-01')
      .field('heartwormVaccinationDate', '2021-01-01')
      .field('externalParasiteVaccination', '2021-01-01')
      .field('description', '테스트용 멍멍이');

    // then
    expect(status).toBe(400);

    // cleanup
    fs.unlinkSync(filePath);
  });

  it('name이 없을때 400을 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath)
      .field('type', 'dog')
      .field('name', '')
      .field('gender', 'male')
      .field('breed', '골대더')
      .field('birthday', '2021-01-01')
      .field('weight', '5')
      .field('neutered', true)
      .field('rabiesVaccinationDate', '2021-01-01')
      .field('comprehensiveVaccinationDate', '2021-01-01')
      .field('covidVaccinationDate', '2021-01-01')
      .field('kennelCoughVaccinationDate', '2021-01-01')
      .field('heartwormVaccinationDate', '2021-01-01')
      .field('externalParasiteVaccination', '2021-01-01')
      .field('description', '테스트용 멍멍이');

    // then
    expect(status).toBe(400);

    // cleanup
    fs.unlinkSync(filePath);
  });

  it('gender가 male이나 female이 아닐때 400을 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath)
      .field('type', 'dog')
      .field('name', 'test-name')
      .field('gender', 'invalid')
      .field('breed', '골대더')
      .field('birthday', '2021-01-01')
      .field('weight', '5')
      .field('neutered', true)
      .field('rabiesVaccinationDate', '2021-01-01')
      .field('comprehensiveVaccinationDate', '2021-01-01')
      .field('covidVaccinationDate', '2021-01-01')
      .field('kennelCoughVaccinationDate', '2021-01-01')
      .field('heartwormVaccinationDate', '2021-01-01')
      .field('externalParasiteVaccination', '2021-01-01')
      .field('description', '테스트용 멍멍이');

    // then
    expect(status).toBe(400);

    // cleanup
    fs.unlinkSync(filePath);
  });

  it('breed는 null이어도 201을 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');
    const spy = jest.spyOn(petService, 'create').mockResolvedValue();

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath)
      .field('type', 'dog')
      .field('name', 'test-name')
      .field('gender', 'male')
      .field('breed', 'null')
      .field('birthday', '2021-01-01')
      .field('weight', '5')
      .field('neutered', true)
      .field('rabiesVaccinationDate', '2021-01-01')
      .field('comprehensiveVaccinationDate', '2021-01-01')
      .field('covidVaccinationDate', '2021-01-01')
      .field('kennelCoughVaccinationDate', '2021-01-01')
      .field('heartwormVaccinationDate', '2021-01-01')
      .field('externalParasiteVaccination', '2021-01-01')
      .field('description', '테스트용 멍멍이');

    // then
    expect(status).toBe(201);

    // cleanup
    fs.unlinkSync(filePath);
    spy.mockRestore();
  });

  it('birthday가 날짜 형식이 아닐때 400을 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath)
      .field('type', 'dog')
      .field('name', 'test-name')
      .field('gender', 'male')
      .field('breed', 'null')
      .field('birthday', 'invalid')
      .field('weight', '5')
      .field('neutered', true)
      .field('rabiesVaccinationDate', '2021-01-01')
      .field('comprehensiveVaccinationDate', '2021-01-01')
      .field('covidVaccinationDate', '2021-01-01')
      .field('kennelCoughVaccinationDate', '2021-01-01')
      .field('heartwormVaccinationDate', '2021-01-01')
      .field('externalParasiteVaccination', '2021-01-01')
      .field('description', '테스트용 멍멍이');
    // then
    expect(status).toBe(400);

    // cleanup
    fs.unlinkSync(filePath);
  });

  it('weight가 숫자 형식이 아닐때 400을 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath)
      .field('type', 'dog')
      .field('name', 'test-name')
      .field('gender', 'male')
      .field('breed', 'null')
      .field('birthday', '2021-01-01')
      .field('weight', 'invalid')
      .field('neutered', true)
      .field('rabiesVaccinationDate', '2021-01-01')
      .field('comprehensiveVaccinationDate', '2021-01-01')
      .field('covidVaccinationDate', '2021-01-01')
      .field('kennelCoughVaccinationDate', '2021-01-01')
      .field('heartwormVaccinationDate', '2021-01-01')
      .field('externalParasiteVaccination', '2021-01-01')
      .field('description', '테스트용 멍멍이');

    // then
    expect(status).toBe(400);

    // cleanup
    fs.unlinkSync(filePath);
  });

  it('neutered가 boolean 형식이 아닐때 400을 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath)
      .field('type', 'dog')
      .field('name', 'test-name')
      .field('gender', 'male')
      .field('breed', 'null')
      .field('birthday', '2021-01-01')
      .field('weight', '5')
      .field('neutered', 'invalid')
      .field('rabiesVaccinationDate', '2021-01-01')
      .field('comprehensiveVaccinationDate', '2021-01-01')
      .field('covidVaccinationDate', '2021-01-01')
      .field('kennelCoughVaccinationDate', '2021-01-01')
      .field('heartwormVaccinationDate', '2021-01-01')
      .field('externalParasiteVaccination', '2021-01-01')
      .field('description', '테스트용 멍멍이');

    // then
    expect(status).toBe(400);

    // cleanup
    fs.unlinkSync(filePath);
  });

  it('rabiesVaccinationDate는 null이어도 201을 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');
    const spy = jest.spyOn(petService, 'create').mockResolvedValue();

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath)
      .field('type', 'dog')
      .field('name', 'test-name')
      .field('gender', 'male')
      .field('breed', 'null')
      .field('birthday', '2021-01-01')
      .field('weight', '5')
      .field('neutered', true)
      .field('rabiesVaccinationDate', 'null')
      .field('comprehensiveVaccinationDate', '2021-01-01')
      .field('covidVaccinationDate', '2021-01-01')
      .field('kennelCoughVaccinationDate', '2021-01-01')
      .field('heartwormVaccinationDate', '2021-01-01')
      .field('externalParasiteVaccination', '2021-01-01')
      .field('description', '테스트용 멍멍이');

    // then
    expect(status).toBe(201);

    // cleanup
    fs.unlinkSync(filePath);
    spy.mockRestore();
  });

  it('description은 공백이어도 201을 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');
    const spy = jest.spyOn(petService, 'create').mockResolvedValue();

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath)
      .field('type', 'dog')
      .field('name', 'test-name')
      .field('gender', 'male')
      .field('breed', 'null')
      .field('birthday', '2021-01-01')
      .field('weight', '5')
      .field('neutered', true)
      .field('rabiesVaccinationDate', 'null')
      .field('comprehensiveVaccinationDate', '2021-01-01')
      .field('covidVaccinationDate', '2021-01-01')
      .field('kennelCoughVaccinationDate', '2021-01-01')
      .field('heartwormVaccinationDate', '2021-01-01')
      .field('externalParasiteVaccination', '2021-01-01')
      .field('description', '');

    // then
    expect(status).toBe(201);

    // cleanup
    fs.unlinkSync(filePath);
    spy.mockRestore();
  });

  it('이미지가 없을때 400을 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('type', 'dog')
      .field('name', 'test-name')
      .field('gender', 'male')
      .field('breed', 'null')
      .field('birthday', '2021-01-01')
      .field('weight', '5')
      .field('neutered', true)
      .field('rabiesVaccinationDate', 'null')
      .field('comprehensiveVaccinationDate', '2021-01-01')
      .field('covidVaccinationDate', '2021-01-01')
      .field('kennelCoughVaccinationDate', '2021-01-01')
      .field('heartwormVaccinationDate', '2021-01-01')
      .field('externalParasiteVaccination', '2021-01-01')
      .field('description', '');

    // then
    expect(status).toBe(400);
  });

  it('정상적인 요청일때 201을 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath)
      .field('type', 'dog')
      .field('name', 'test-name')
      .field('gender', 'male')
      .field('breed', 'null')
      .field('birthday', '2021-01-01')
      .field('weight', '5.2')
      .field('neutered', true)
      .field('rabiesVaccinationDate', 'null')
      .field('comprehensiveVaccinationDate', '2021-01-01')
      .field('covidVaccinationDate', '2021-01-01')
      .field('kennelCoughVaccinationDate', '2021-01-01')
      .field('heartwormVaccinationDate', '2021-01-01')
      .field('externalParasiteVaccination', '2021-01-01')
      .field('description', '');

    // then
    expect(status).toBe(201);
    const pet = await prisma.pet.findFirst();
    expect(pet).toBeTruthy();
    const s3Client = new S3Client();
    const response = await s3Client.send(
      new HeadObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `pets/${pet!.image.split('/').pop()}`,
      }),
    );
    expect(response.$metadata.httpStatusCode).toEqual(200);

    // cleanup
    fs.unlinkSync(filePath);
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `pets/${pet!.image.split('/').pop()}`,
      }),
    );
  });
});
