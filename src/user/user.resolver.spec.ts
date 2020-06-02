import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@/user/user.service';
import { UserResolver } from '@/user/user.resolver';
import { UserEntity } from '@/user/user.entity';
import { Profile } from '@/user/profile.model';
import { UserRepository } from '@/user/user.repository';
import { getRepository, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FollowsEntity } from '@/user/follows.entity';

describe('UserResolver', () => {
  let userResolver: UserResolver;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        UserService,
        UserRepository,
        {
          provide: getRepositoryToken(FollowsEntity),
          useClass: class MockRepository extends Repository<FollowsEntity> {},
        },
      ],
    }).compile();

    userResolver = module.get<UserResolver>(UserResolver);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('resolves "profile" field', async () => {
    const mockProfile = new Profile();
    const mockUsername = 'username';
    const mockUser = new UserEntity();
    const serviceGetProfile = jest
      .spyOn(userService, 'getProfile')
      .mockResolvedValue(mockProfile);

    expect(await userResolver.getProfile(mockUsername, mockUser)).toBe<Profile>(
      mockProfile,
    );
    expect(serviceGetProfile).toHaveBeenCalled();
  });

  it('resolves "followUser" mutation', async () => {
    const mockProfile = new Profile();
    const mockFolloweeUsername = 'followee_username';
    const mockUser = new UserEntity();
    const serviceFollowUser = jest
      .spyOn(userService, 'followUser')
      .mockResolvedValue(mockProfile);

    expect(await userResolver.followUser(mockFolloweeUsername, mockUser)).toBe<
      Profile
    >(mockProfile);
    expect(serviceFollowUser).toHaveBeenCalled();
  });

  it('resolves "unfollowUser" mutation', async () => {
    const mockProfile = new Profile();
    const mockFolloweeUsername = 'followee_username';
    const mockUser = new UserEntity();
    const serviceUnfollowUser = jest
      .spyOn(userService, 'unfollowUser')
      .mockResolvedValue(mockProfile);

    expect(
      await userResolver.unfollowUser(mockFolloweeUsername, mockUser),
    ).toBe<Profile>(mockProfile);
    expect(serviceUnfollowUser).toHaveBeenCalled();
  });
});
