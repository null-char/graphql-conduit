import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@/user/user.entity';
import { Profile } from '@/user/profile.model';
import { FollowsEntity } from '@/user/follows.entity';
import { Repository } from 'typeorm';
import { UserRepository } from '@/user/user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(FollowsEntity)
    private followsRepository: Repository<FollowsEntity>,
  ) {}

  public async createUser(
    username: string,
    salt: string,
    hashedPassword: string,
    email: string,
  ): Promise<UserEntity> {
    const userWithSameEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (userWithSameEmail) {
      throw new ConflictException('User with the same email already exists');
    }

    const userWithSameUsername = await this.userRepository.findOne({
      where: { username },
    });
    if (userWithSameUsername) {
      throw new ConflictException('User with same username already exists');
    }

    const newUser = {
      username,
      salt,
      password: hashedPassword,
      email,
    };

    return this.userRepository.save(newUser);
  }

  public async getProfile(username: string, user: UserEntity | undefined) {
    const qb = this.userRepository.createQueryBuilder('u');
    qb.where('u.username = :username', { username });

    if (user) {
      qb.addSelect(
        'u.id IN ' +
          qb
            .subQuery()
            .select('follows.followee')
            .from(FollowsEntity, 'follows')
            .where('follows.follower = :uid', { uid: user.id })
            .getQuery(),
        'u_following',
      );
    }

    return qb.getOne();
  }

  public async followUser(
    user: UserEntity,
    followeeUsername: string,
  ): Promise<Profile> {
    const followee = await this.userRepository.findUserByUsername(
      followeeUsername,
    );
    await this.followsRepository.insert({
      follower: user.id,
      followee: followee.id,
    });
    followee.followersCount += 1;

    return {
      ...(await this.userRepository.save(followee)),
      following: true,
    };
  }

  public async unfollowUser(
    user: UserEntity,
    followeeUsername: string,
  ): Promise<Profile> {
    const followee = await this.userRepository.findUserByUsername(
      followeeUsername,
    );
    await this.followsRepository.delete({
      follower: user.id,
      followee: followee.id,
    });
    followee.followersCount -= 1;

    return {
      ...(await this.userRepository.save(followee)),
      following: false,
    };
  }
}
