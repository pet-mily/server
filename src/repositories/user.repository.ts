import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findUserByProvider(provider: string, providerId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }
    return user;
  }

  async createUser(createUserInput: {
    provider: string;
    providerId: string;
    name: string;
    phoneNumber: string;
  }) {
    try {
      return await this.prisma.user.create({
        data: {
          provider: createUserInput.provider,
          providerId: createUserInput.providerId,
          name: createUserInput.name,
          phoneNumber: createUserInput.phoneNumber,
        },
        select: {
          id: true,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new HttpException('User already exists', 409);
      } else throw e;
    }
  }

  async saveRefreshToken(userId: string, refreshToken: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken,
      },
    });
    return;
  }

  async findRefreshToken(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        refreshToken: true,
      },
    });

    return user.refreshToken;
  }
}
