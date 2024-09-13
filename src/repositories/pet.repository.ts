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
      imageExt: string;
    },
  ) {
    return this.prisma.pet.create({
      data: {
        ...petData,
        ownerId: userId,
      },
      select: {
        id: true,
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
        imageExt: true,
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
        imageExt: true,
        ownerId: true,
      },
    });

    if (!pet) {
      throw new HttpException('Pet not found', 404);
    }
    return pet;
  }
}
