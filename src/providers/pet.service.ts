import { Injectable } from '@nestjs/common';
import { PetRepository } from 'src/repositories/pet.repository';
import { AwsService } from 'src/aws/aws.service';
import { v4 as uuidv4 } from 'uuid';
import { catBreeds, dogBreeds } from 'src/constants';

@Injectable()
export class PetService {
  constructor(
    private petRepository: PetRepository,
    private awsService: AwsService,
  ) {}

  async create(userId: string, createInput: CreateInput) {
    const { image, ...rest } = createInput;
    const imageExt = image.originalname.split('.').pop();
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
    const pet = await this.petRepository.findOneById(petId);

    return {
      ...pet,
      birthday: pet.birthday.toISOString().split('T')[0],
      rabiesVaccinationDate: pet.rabiesVaccinationDate
        ? pet.rabiesVaccinationDate.toISOString().split('T')[0]
        : null,
      comprehensiveVaccinationDate: pet.comprehensiveVaccinationDate
        ? pet.comprehensiveVaccinationDate.toISOString().split('T')[0]
        : null,
      covidVaccinationDate: pet.covidVaccinationDate
        ? pet.covidVaccinationDate.toISOString().split('T')[0]
        : null,
      kennelCoughVaccinationDate: pet.kennelCoughVaccinationDate
        ? pet.kennelCoughVaccinationDate.toISOString().split('T')[0]
        : null,
      heartwormVaccinationDate: pet.heartwormVaccinationDate
        ? pet.heartwormVaccinationDate.toISOString().split('T')[0]
        : null,
      externalParasiteVaccination: pet.externalParasiteVaccination
        ? pet.externalParasiteVaccination.toISOString().split('T')[0]
        : null,
    };
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
    return {
      image: imageUrl,
    };
  }

  async update(updateInput: UpdateInput) {
    await this.petRepository.update(updateInput);
    return;
  }

  async deleteOne(petId: string, userId: string) {
    const image = await this.petRepository.deleteOne(petId, userId);
    const imageKey = image.split('/').pop();
    await this.awsService.deletePetImage(imageKey!);
    return;
  }

  getBreeds(type: 'CAT' | 'DOG') {
    if (type === 'CAT') {
      return catBreeds;
    }
    return dogBreeds;
  }
}

export interface CreateInput {
  type: 'CAT' | 'DOG';
  name: string;
  gender: 'MALE' | 'FEMAIL';
  breed: string | null;
  birthday: Date;
  weight: number;
  neutered: boolean;
  rabiesVaccinationDate: Date | null;
  comprehensiveVaccinationDate: Date | null;
  covidVaccinationDate: Date | null;
  kennelCoughVaccinationDate: Date | null;
  heartwormVaccinationDate: Date | null;
  externalParasiteVaccination: Date | null;
  description: string;
  image: Express.Multer.File;
}

export interface UpdateInput {
  userId: string;
  petId: string;
  type: 'CAT' | 'DOG';
  name: string;
  gender: 'MALE' | 'FEMAIL';
  breed: string | null;
  birthday: Date;
  weight: number;
  neutered: boolean;
  rabiesVaccinationDate: Date | null;
  comprehensiveVaccinationDate: Date | null;
  covidVaccinationDate: Date | null;
  kennelCoughVaccinationDate: Date | null;
  heartwormVaccinationDate: Date | null;
  externalParasiteVaccination: Date | null;
  description: string;
}
