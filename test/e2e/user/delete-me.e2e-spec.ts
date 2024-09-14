import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { signup } from '../helpers';

describe('DELETE /users/me - 회원탈퇴', () => {
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

  it('204를 반환하며 데이터베이스에서 유저를 삭제한다', async () => {
    // given
    const { accessToken } = await signup(app);

    // when
    const response = await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(204);
    const user = await prisma.user.findFirst();
    expect(user).toBeNull();
  });

  it('pet정보가 있을 경우 pet 정보도 삭제한다', async () => {
    // given
    const { accessToken } = await signup(app);
    const user = await prisma.user.findFirst();
    await prisma.pet.create({
      data: {
        ownerId: user!.id,
        type: 'DOG',
        name: '멍멍이',
        gender: 'MALE',
        breed: '푸들',
        weight: 5.5,
        neutered: true,
        birthday: new Date('2021-01-01'),
        description: '테스트용 멍멍이',
        image: 'https://test.com/image1.jpg',
      },
    });

    // when
    const response = await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(204);
    const pet = await prisma.pet.findFirst();
    expect(pet).toBeNull();
  });
});
