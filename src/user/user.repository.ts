import { EntityRepository, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserEntity } from '@/user/user.entity';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  public async findUserByUsername(username: string): Promise<UserEntity> {
    const user = await this.findOne({ where: { username } });
    if (!user)
      throw new NotFoundException(`User with username ${username} not found`);

    user.following = null;
    return user;
  }

  public async findUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.findOne({ where: { email } });
    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);

    user.following = null;
    return user;
  }

  /**
   * This function seems redundant but it additionally checks if user exists and throws
   * a NotFoundException otherwise.
   */
  public async findUserById(id: number): Promise<UserEntity> {
    const user = await this.findOne(id);
    if (!user)
      throw new NotFoundException(`User with the requested id not found`);

    user.following = null;
    return user;
  }
}
