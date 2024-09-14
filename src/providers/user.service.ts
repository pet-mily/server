import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async delete(userId: string) {
    await this.userRepository.deleteById(userId);
    return;
  }

  async update(
    userId: string,
    updateUserInput: {
      name: string;
      phoneNumber: string;
      address: string | null;
      detailAddress: string | null;
    },
  ) {
    await this.userRepository.update(userId, updateUserInput);
    return;
  }
}
