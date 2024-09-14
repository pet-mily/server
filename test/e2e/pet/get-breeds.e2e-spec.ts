import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { signup } from '../helpers';
import { catBreeds, dogBreeds } from 'src/constants';

describe('GET /pets/breeds?type - 반려동물 품종 조회', () => {
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

  it('type이 CAT이나 DOG가 아니면 400을 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);

    // when
    const { status } = await request(app.getHttpServer())
      .get('/pets/breeds?type=HUMAN')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(400);
  });

  it('type이 CAT이면 200과 함께 고양이 품종 리스트를 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);

    // when
    const { status, body } = await request(app.getHttpServer())
      .get('/pets/breeds?type=CAT')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(200);
    expect(body).toEqual(catBreeds);
  });

  it('type이 DOG이면 200과 함께 강아지 품종 리스트를 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);

    // when
    const { status, body } = await request(app.getHttpServer())
      .get('/pets/breeds?type=DOG')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(200);
    expect(body).toEqual(dogBreeds);
  });
});
