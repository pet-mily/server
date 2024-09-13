import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { signup } from '../helpers';

describe('GET /pets/:petId - 반려동물 상세 조회', () => {
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

  it('반려동물이 없으면 404를 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);

    // when
    const response = await request(app.getHttpServer())
      .get('/pets/1')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(404);
  });

  it('반려동물이 있으면 반려동물 상세 정보를 반환한다', async () => {
    // given
    const { accessToken } = await signup(app);
    const user = await prisma.user.findFirst();
    const pet = await prisma.pet.create({
      data: {
        ownerId: user!.id,
        type: 'DOG',
        name: '멍멍이',
        breed: '푸들',
        birthday: new Date('2021-01-01'),
        heartwormPrevention: true,
        description: '테스트용 멍멍이',
        image: 'https://test.com/image1.jpg',
      },
    });

    // when
    const response = await request(app.getHttpServer())
      .get(`/pets/${pet.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: pet.id,
      type: 'DOG',
      name: '멍멍이',
      breed: '푸들',
      birthday: '2021-01-01T00:00:00.000Z',
      heartwormPrevention: true,
      description: '테스트용 멍멍이',
      image: `https://test.com/image1.jpg`,
      ownerId: user!.id,
    });
  });
});
