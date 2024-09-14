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
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

describe('PATCH /pets/:petId/image - 반려동물 이미지 수정', () => {
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

  it('200를 반환하며 기존 이미지를 삭제하고, 새로운 이미지를 등록한다', async () => {
    // given
    const { accessToken } = await signup(app);
    const user = await prisma.user.findFirst();
    const pet = await prisma.pet.create({
      data: {
        ownerId: user!.id,
        type: 'DOG',
        name: '멍멍이',
        gender: 'MALE',
        breed: null,
        weight: 5.5,
        neutered: true,
        birthday: new Date('2021-01-01'),
        description: '테스트용 멍멍이',
        image: 'https://test.com/image1.jpg',
      },
    });
    const s3Client = new S3Client();
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `pets/image1.jpg`,
        Body: Buffer.from('test-image'),
      }),
    );

    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');

    // when
    const { status, body } = await request(app.getHttpServer())
      .patch(`/pets/${pet.id}/image`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath);

    // then
    expect(status).toBe(200);
    expect(body.image).toContain('https');
    const updatedPet = await prisma.pet.findUnique({
      where: {
        id: pet.id,
      },
    });
    expect(updatedPet!.image).not.toBe('https://test.com/image1.jpg');
    expect(async () => {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `pets/image1.jpg`,
        }),
      );
    }).rejects.toThrow();

    // cleanup
    fs.unlinkSync(filePath);
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `pets/${updatedPet!.image.split('/').pop()}`,
      }),
    );
  });
});
