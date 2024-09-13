import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { signup } from '../helpers';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';

describe('DELETE /pets/:petId - 반려동물 삭제', () => {
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

  it('204를 반환하며 데이터베이스에서 반려동물을 삭제하고 S3 이미지도 삭제한다', async () => {
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

    const s3Client = new S3Client();
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: 'pets/image1.jpg',
        Body: Buffer.from('test-body'),
      }),
    );

    // when
    await request(app.getHttpServer())
      .delete(`/pets/${pet.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    // then
    const petInDB = await prisma.pet.findUnique({
      where: {
        id: pet.id,
      },
    });
    expect(petInDB).toBeNull();

    await expect(
      s3Client.send(
        new HeadObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: 'pets/image1.jpg',
        }),
      ),
    ).rejects.toThrow();
  });
});
