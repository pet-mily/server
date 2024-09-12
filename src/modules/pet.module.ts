import { Module } from '@nestjs/common';
import { PetController } from '../controllers/pet.controller';
import { PetService } from 'src/providers/pet.service';
import { PetRepository } from 'src/repositories/pet.repository';
import { MulterModule } from '@nestjs/platform-express';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [
    AwsModule,
    MulterModule.register({
      fileFilter: (req, file, cb) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString(
          'utf8',
        );
        cb(null, true);
      },
    }),
  ],
  controllers: [PetController],
  providers: [PetService, PetRepository],
})
export class PetModule {}
