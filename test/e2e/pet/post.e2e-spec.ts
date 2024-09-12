import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { login } from '../helpers';
import * as fs from 'fs';
import * as path from 'path';

describe('POST /pets', () => {
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

  it('이미지가 없을때 400을 반환한다', async () => {
    // given
    const { accessToken } = await login(app);

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        type: 'DOG',
        name: '멍멍이',
        breed: '푸들',
        birthday: '2021-01-01',
        heartwormPrevention: true,
        description: '테스트용 멍멍이',
      });

    // then
    expect(status).toBe(400);
  });

  it('type이 DOG나 CAT이 아닐때 400을 반환한다', async () => {
    // given
    const { accessToken } = await login(app);
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath)
      .field('type', 'INVALID')
      .field('name', '멍멍이')
      .field('breed', '푸들')
      .field('birthday', '2021-01-01')
      .field('heartwormPrevention', true)
      .field('description', '테스트용 멍멍이');

    // then
    expect(status).toBe(400);

    // cleanup
    fs.unlinkSync(filePath);
  });

  it('name이 없을때 400을 반환한다', async () => {
    // given
    const { accessToken } = await login(app);
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath)
      .field('type', 'DOG')
      .field('breed', '푸들')
      .field('birthday', '2021-01-01')
      .field('heartwormPrevention', true)
      .field('description', '테스트용 멍멍이');

    const { status: status2 } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath)
      .field('type', 'DOG')
      .field('name', '')
      .field('breed', '푸들')
      .field('birthday', '2021-01-01')
      .field('heartwormPrevention', true)
      .field('description', '테스트용 멍멍이');

    // then
    expect(status).toBe(400);
    expect(status2).toBe(400);

    // cleanup
    fs.unlinkSync(filePath);
  });

  it('birthday가 날짜 형식이 아닐때 400을 반환한다', async () => {
    // given
    const { accessToken } = await login(app);
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath)
      .field('type', 'DOG')
      .field('name', '멍멍이')
      .field('breed', '푸들')
      .field('birthday', 'INVALID')
      .field('heartwormPrevention', true)
      .field('description', '테스트용 멍멍이');

    // then
    expect(status).toBe(400);

    // cleanup
    fs.unlinkSync(filePath);
  });

  it('heartwormPrevention이 boolean 형식이 아닐때 400을 반환한다', async () => {
    // given
    const { accessToken } = await login(app);
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath)
      .field('type', 'DOG')
      .field('name', '멍멍이')
      .field('breed', '푸들')
      .field('birthday', '2021-01-01')
      .field('heartwormPrevention', 'INVALID')
      .field('description', '테스트용 멍멍이');

    // then
    expect(status).toBe(400);

    // cleanup
    fs.unlinkSync(filePath);
  });

  // TODO: petService단 모킹해야함
  it('description은 공백이어도 201을 반환한다', async () => {
    // given
    const { accessToken } = await login(app);
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');

    // when
    const { status } = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath)
      .field('type', 'DOG')
      .field('name', '멍멍이')
      .field('breed', '푸들')
      .field('birthday', '2021-01-01')
      .field('heartwormPrevention', true)
      .field('description', '');

    // then
    expect(status).toBe(201);

    // cleanup
    fs.unlinkSync(filePath);
  });
});
