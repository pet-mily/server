import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { signup } from '../helpers';

describe('PUT /users/me - 내 정보 수정', () => {
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
    await prisma.user.deleteMany();
  });

  it('name이 없으면 400을 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);

    // when
    const { status } = await request(app.getHttpServer())
      .put('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        phoneNumber: '01012345678',
        address: 'test address',
        detailAddress: 'test detail address',
      });

    // then
    expect(status).toBe(400);
  });

  it('phoneNumber이 없으면 400을 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);

    // when
    const { status } = await request(app.getHttpServer())
      .put('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'test name',
        phoneNumber: '',
        address: 'test address',
        detailAddress: 'test detail address',
      });

    // then
    expect(status).toBe(400);
  });

  it('address는 null이어도 204를 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);

    // when
    const { status } = await request(app.getHttpServer())
      .put('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'test name',
        phoneNumber: '01012345678',
        address: null,
        detailAddress: null,
      });

    // then
    expect(status).toBe(204);
  });

  it('유저 정보를 수정한다', async () => {
    // given
    const { accessToken } = await signup(app);

    // when
    const { status } = await request(app.getHttpServer())
      .put('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'test name',
        phoneNumber: '01012345678',
        address: 'test address',
        detailAddress: 'test detail address',
      });

    // then
    expect(status).toBe(204);
    const user = await prisma.user.findFirst();
    expect(user?.name).toBe('test name');
    expect(user?.phoneNumber).toBe('01012345678');
    expect(user?.address).toBe('test address');
    expect(user?.detailAddress).toBe('test detail address');
  });
});
