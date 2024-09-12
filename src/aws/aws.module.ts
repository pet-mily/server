import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  providers: [AwsService, S3Client],
  exports: [AwsService],
})
export class AwsModule {}
