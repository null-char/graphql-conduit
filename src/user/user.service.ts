import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@/user/user.entity';
import { UserRepository } from '@/user/user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  public async createUser(
    username: string,
    salt: string,
    hashedPassword: string,
    email: string,
  ): Promise<UserEntity> {
    return this.userRepository.createUser(
      username,
      salt,
      hashedPassword,
      email,
    );
  }
}
