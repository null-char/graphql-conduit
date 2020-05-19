import * as dotenv from 'dotenv';
dotenv.config();
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '@/auth/jwt.strategy';
import { UserEntity } from '@/user/user.entity';
import { JwtPayload } from '@/auth/jwt-payload.type';
import { UserService } from '@/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowsEntity } from '@/user/follows.entity';
import { UserRepository } from '@/user/user.repository';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: class MockRepository extends Repository<UserEntity> {},
        },
        {
          provide: getRepositoryToken(FollowsEntity),
          useClass: class MockRepository extends Repository<FollowsEntity> {},
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('gets a user with the id received in payload', async () => {
    const mockUser = new UserEntity();
    const mockPayload: JwtPayload = {
      sub: 1,
      email: 'email@email.com',
      username: 'username',
    };
    const getUserById = jest
      .spyOn(userRepository, 'findUserById')
      .mockResolvedValue(mockUser);

    expect(await jwtStrategy.validate(mockPayload)).toBe(mockUser);
    expect(getUserById).toHaveBeenCalled();
  });
});
