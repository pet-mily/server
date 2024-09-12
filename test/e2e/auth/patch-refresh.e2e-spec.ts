import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';

describe('PATCH /auth/refresh', () => {
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

  it('refreshToken이 없는 경우 401을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .patch('/auth/refresh')
      .send({
        refreshToken: '',
      });

    // then
    expect(status).toBe(401);
  });

  it('refreshToken이 유효하지 않은 경우 401을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .patch('/auth/refresh')
      .send({
        refreshToken: 'invalid-token',
      });

    // then
    expect(status).toBe(401);
  });

  it('refreshToken이 유효한 경우 200과 함께 새로운 accessToken, refreshToken을 반환한다', async () => {
    // given
    jest.spyOn(authService, 'getKakaoProfile').mockResolvedValue({
      id: 'test-id',
    });

    const {
      body: { refreshToken },
    } = await request(app.getHttpServer()).post('/auth/signup').send({
      provider: 'KAKAO',
      providerAccessToken: 'test-token',
    });

    // when
    const { status, body } = await request(app.getHttpServer())
      .patch('/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`)
      .send({
        refreshToken,
      });

    // then
    expect(status).toBe(200);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
  });
});
