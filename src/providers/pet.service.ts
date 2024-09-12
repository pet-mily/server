import { Injectable } from '@nestjs/common';
import { PetRepository } from 'src/repositories/pet.repository';
import { AwsService } from 'src/aws/aws.service';

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
    const { id: petId } = await this.petRepository.create(userId, {
      ...rest,
      imageExt,
    });
    await this.awsService.uploadPetImage(petId, image);
    return;
  }
}
