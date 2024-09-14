import { Module } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';
import { UserService } from 'src/providers/user.service';
import { UserController } from 'src/controllers/user.controller';

@Module({
  controllers: [UserController],
  providers: [UserRepository, UserService],
  exports: [UserRepository],
})
export class UserModule {}
