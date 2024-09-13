import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpException } from '@nestjs/common';

@Injectable()
export class PetRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    petData: {
      type: 'CAT' | 'DOG';
      name: string;
      breed: string;
      birthday: Date;
      heartwormPrevention: boolean;
      description: string;
      image: string;
    },
  ) {
    return this.prisma.pet.create({
      data: {
        ...petData,
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
        name: true,
        type: true,
        breed: true,
        birthday: true,
        heartwormPrevention: true,
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
    await this.prisma.pet.update({
      where: {
        id: updateInput.petId,
        ownerId: updateInput.userId,
      },
      data: {
        type: updateInput.type,
        name: updateInput.name,
        breed: updateInput.breed,
        birthday: updateInput.birthday,
        heartwormPrevention: updateInput.heartwormPrevention,
        description: updateInput.description,
      },
      select: {},
    });

    return;
  }
}

export interface UpdateInput {
  userId: string;
  petId: string;
  type: 'CAT' | 'DOG';
  name: string;
  breed: string;
  birthday: Date;
  heartwormPrevention: boolean;
  description: string;
}
