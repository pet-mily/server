import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';

describe('POST /auth/signup - 회원가입', () => {
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

  it('이미 있는 유저인 경우 409를 반환한다', async () => {
    // given
    jest.spyOn(authService, 'getKakaoProfile').mockResolvedValue({
      id: 'test-provider-id',
    });
    await prisma.user.create({
      data: {
        provider: 'KAKAO',
        providerId: 'test-provider-id',
      },
    });

    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        provider: 'KAKAO',
        providerAccessToken: 'test-token',
      });

    // then
    expect(status).toBe(409);
  });

  it('정상적으로 유저가 없는 경우 201과 함께 accessToken, refreshToken을 반환하고 데이터베이스에 유저가 생성된다', async () => {
    // given
    jest.spyOn(authService, 'getKakaoProfile').mockResolvedValue({
      id: 'test-provider-id',
    });

    // when
    const { status, body } = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        provider: 'KAKAO',
        providerAccessToken: 'test-token',
      });

    // then
    expect(status).toBe(201);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
    const user = await prisma.user.findFirst();
    expect(user?.providerId).toBe('test-provider-id');
  });
});
