import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  constructor(
    private configService: ConfigService,
    private readonly s3Client: S3Client,
  ) {}

  async uploadPetImage(petId: string, image: Express.Multer.File) {
    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: `pets/${petId}.${image.originalname.split('.').pop()}`,
      Body: image.buffer,
      ContentType: image.mimetype,
    });

    return this.s3Client.send(command);
  }
}
