import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
