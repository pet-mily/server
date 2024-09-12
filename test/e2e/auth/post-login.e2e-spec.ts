import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';

describe('POST /auth/login - 로그인', () => {
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
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('provider가 kakao, naver가 아닌 경우 400을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        provider: 'google',
        providerAccesstoken: 'test-token',
      });

    // then
    expect(status).toBe(400);
  });

  it('providerAccessToken이 없는 경우 400을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        provider: 'KAKAO',
        providerAccessToken: '',
      });

    // then
    expect(status).toBe(400);
  });

  it('없는 유저인 경우 404을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        provider: 'KAKAO',
        providerAccessToken: 'test-token',
      });

    // then
    expect(status).toBe(404);
  });

  it('정상적으로 유저가 있는 경우 200과 함께 accessToken, refreshToken을 반환한다', async () => {
    // given
    jest.spyOn(authService, 'getKakaoProfile').mockResolvedValue({
      id: 'test-id',
    });

    await prisma.user.create({
      data: {
        provider: 'KAKAO',
        providerId: 'test-id',
      },
    });

    // when
    const { status, body } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        provider: 'KAKAO',
        providerAccessToken: 'test-token',
      });

    // then
    expect(status).toBe(200);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
  });
});
