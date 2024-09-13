import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  constructor(
    private configService: ConfigService,
    private readonly s3Client: S3Client,
  ) {}

  async uploadPetImage(image: Express.Multer.File, imageKey: string) {
    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: `pets/${imageKey}`,
      Body: image.buffer,
      ContentType: image.mimetype,
    });

    return await this.s3Client.send(command);
  }

  getPetImageUrl(key: string) {
    return `${this.configService.get('AWS_CLOUDFRONT_URL')}/pets/${key}`;
  }

  async deletePetImage(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: `pets/${key}`,
    });

    return await this.s3Client.send(command);
  }

  async updatePetImage({
    image,
    beforeImageKey,
    afterImageKey,
  }: {
    image: Express.Multer.File;
    beforeImageKey: string;
    afterImageKey: string;
  }) {
    await this.deletePetImage(beforeImageKey);
    await this.uploadPetImage(image, afterImageKey);
    return;
  }
}
