import { Injectable } from '@nestjs/common';
import { PetRepository } from 'src/repositories/pet.repository';
import { AwsService } from 'src/aws/aws.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PetService {
  constructor(
    private petRepository: PetRepository,
    private awsService: AwsService,
  ) {}

  async create(
    userId: string,
    petData: {
      type: 'CAT' | 'DOG';
      name: string;
      breed: string;
      birthday: Date;
      heartwormPrevention: boolean;
      description: string;
      image: Express.Multer.File;
    },
  ) {
    const { image, ...rest } = petData;
    const imageExt = petData.image.originalname.split('.').pop();
    if (!imageExt) {
      console.log(image);
      throw new Error('Invalid image file');
    }
    const imageId = uuidv4();
    const imageKey = `${imageId}.${imageExt}`;
    const imageUrl = this.awsService.getPetImageUrl(imageKey);

    await this.petRepository.create(userId, {
      ...rest,
      image: imageUrl,
    });
    await this.awsService.uploadPetImage(image, imageKey);
    return;
  }

  async getManyByUserId(userId: string) {
    return await this.petRepository.findManyByOnwerId(userId);
  }

  async getOneById(petId: string) {
    return await this.petRepository.findOneById(petId);
  }

  async updateImage(petId: string, image: Express.Multer.File) {
    const imageExt = image.originalname.split('.').pop();
    if (!imageExt) {
      console.log(image);
      throw new Error('Invalid image file');
    }
    const imageId = uuidv4();
    const imageKey = `${imageId}.${imageExt}`;
    const imageUrl = this.awsService.getPetImageUrl(imageKey);

    const beforeImage =
      await this.petRepository.updateImageAndReturnPreviousImage(
        petId,
        imageUrl,
      );
    const beforeImageKey = beforeImage.split('/').pop();

    await this.awsService.updatePetImage({
      image,
      beforeImageKey: beforeImageKey!,
      afterImageKey: imageKey,
    });
    return;
  }
}
