import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PipesModule } from './common/pipes/pipes.module';
import { AuthModule } from './auth/auth.module';
import { PetModule } from './modules/pet.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      cache: true,
    }),
    PipesModule,
    PetModule,
  ],
})
export class AppModule {}
