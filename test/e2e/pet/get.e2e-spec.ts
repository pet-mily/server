import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { signup } from '../helpers';

describe('GET /pets - 내 반려동물 리스트 조회', () => {
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

  it('내 반려동물 리스트를 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);
    const user = await prisma.user.findFirst();
    await prisma.pet.createMany({
      data: [
        {
          ownerId: user!.id,
          type: 'DOG',
          name: '멍멍이',
          breed: '푸들',
          birthday: new Date('2021-01-01'),
          heartwormPrevention: true,
          description: '테스트용 멍멍이',
          image: 'test-image-url',
        },
        {
          ownerId: user!.id,
          type: 'CAT',
          name: '야옹이',
          breed: '코숏',
          birthday: new Date('2021-01-01'),
          heartwormPrevention: true,
          description: '테스트용 야옹이',
          image: 'test-image-url',
        },
      ],
    });

    // when
    const { status, body } = await request(app.getHttpServer())
      .get('/pets')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          type: 'DOG',
          name: '멍멍이',
          image: expect.any(String),
        }),
        expect.objectContaining({
          id: expect.any(String),
          type: 'CAT',
          name: '야옹이',
          image: expect.any(String),
        }),
      ]),
    );
  });

  it('반려동물이 없을때 빈 배열을 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);

    // when
    const { status, body } = await request(app.getHttpServer())
      .get('/pets')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(200);
    expect(body).toHaveLength(0);
  });
});
