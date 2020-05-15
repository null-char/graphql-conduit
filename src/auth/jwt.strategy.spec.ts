import * as dotenv from 'dotenv';
dotenv.config();
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '@/auth/jwt.strategy';
import { UserRepository } from '@/user/user.repository';
import { UserEntity } from '@/user/user.entity';
import { JwtPayload } from '@/auth/jwt-payload.interface';

describe('JwtStrategy unit test', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy, UserRepository],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('gets a user from the UserRepository with the id received in payload', async () => {
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
