import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpException } from '@nestjs/common';

@Injectable()
export class PetRepository {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createInput: CreateInput) {
    return this.prisma.pet.create({
      data: {
        ...createInput,
        ownerId: userId,
      },
    });
  }

  async findManyByOnwerId(ownerId: string) {
    return this.prisma.pet.findMany({
      where: {
        ownerId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        image: true,
      },
    });
  }

  async findOneById(petId: string) {
    const pet = await this.prisma.pet.findUnique({
      where: {
        id: petId,
      },
      select: {
        id: true,
        type: true,
        name: true,
        gender: true,
        breed: true,
        birthday: true,
        weight: true,
        neutered: true,
        rabiesVaccinationDate: true,
        comprehensiveVaccinationDate: true,
        covidVaccinationDate: true,
        kennelCoughVaccinationDate: true,
        heartwormVaccinationDate: true,
        externalParasiteVaccination: true,
        description: true,
        image: true,
        ownerId: true,
      },
    });

    if (!pet) {
      throw new HttpException('Pet not found', 404);
    }
    return pet;
  }

  async updateImageAndReturnPreviousImage(petId: string, image: string) {
    const [beforePet] = await this.prisma.$transaction([
      this.prisma.pet.findUniqueOrThrow({
        where: {
          id: petId,
        },
        select: {
          image: true,
        },
      }),
      this.prisma.pet.update({
        where: {
          id: petId,
        },
        data: {
          image,
        },
      }),
    ]);
    return beforePet.image;
  }

  async update(updateInput: UpdateInput) {
    const { userId, petId, ...data } = updateInput;
    await this.prisma.pet.update({
      where: {
        id: petId,
        ownerId: userId,
      },
      data: {
        ...data,
      },
    });

    return;
  }

  async deleteOne(petId: string, userId: string) {
    const { image } = await this.prisma.pet.delete({
      where: {
        id: petId,
        ownerId: userId,
      },
      select: {
        image: true,
      },
    });
    return image;
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
  image: string;
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
