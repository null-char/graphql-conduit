import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@/user/user.service';
import { UserRepository } from '@/user/user.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FollowsEntity } from '@/user/follows.entity';
import {
  Repository,
  SelectQueryBuilder,
  InsertResult,
  DeleteResult,
} from 'typeorm';
import { Profile } from '@/user/profile.model';
import { UserEntity } from '@/user/user.entity';
import { ConflictException } from '@nestjs/common';

const mockProfile = new Profile();

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;
  let followsRepository: Repository<FollowsEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        UserRepository,
        {
          provide: getRepositoryToken(FollowsEntity),
          useClass: class MockRepository extends Repository<FollowsEntity> {},
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    followsRepository = module.get<Repository<FollowsEntity>>(
      getRepositoryToken(FollowsEntity),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createUser', () => {
    let mockUsername: string;
    let mockSalt: string;
    let mockPassword: string;
    let mockEmail: string;
    let mockResult: UserEntity;
    let serviceCreateUser: () => Promise<UserEntity>;

    beforeEach(() => {
      mockUsername = 'username';
      mockSalt = 'salt';
      mockPassword = 'hash';
      mockEmail = 'username@username.com';
      mockResult = new UserEntity();

      // for brevity sake
      serviceCreateUser = async () =>
        userService.createUser(mockUsername, mockSalt, mockPassword, mockEmail);
    });

    it('creates a valid user', async () => {
      // return undefined when checking if user with similar details exist
      const repositoryFindOne = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(undefined);
      const repositorySave = jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(mockResult);

      expect(await serviceCreateUser()).toBe<UserEntity>(mockResult);
      expect(repositoryFindOne).toHaveBeenCalledTimes(2);
      expect(repositorySave).toHaveBeenCalled();
    });

    it('throws an error if user with same email exists', async () => {
      const repositoryFindOne = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(new UserEntity());

      await expect(serviceCreateUser()).rejects.toThrowError(ConflictException);
      expect(repositoryFindOne).toHaveBeenCalled();
    });

    it('throws an error if user with same username exists', async () => {
      // return undefined for first call (when checking for same email)
      const repositoryFindOne = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(new UserEntity());

      await expect(serviceCreateUser()).rejects.toThrowError(ConflictException);
      expect(repositoryFindOne).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    let whereSpy: jest.Mock;
    let getOneSpy: jest.Mock;
    let addSelectSpy: jest.Mock;
    let mockCreateQueryBuilder: jest.Mock<SelectQueryBuilder<UserEntity>, []>;

    beforeEach(() => {
      // create query builder related mocks

      whereSpy = jest.fn().mockReturnThis();
      getOneSpy = jest.fn().mockResolvedValue(mockProfile);
      addSelectSpy = jest.fn().mockReturnThis();
      // return 'this' to mock a chained api
      mockCreateQueryBuilder = jest.fn(
        () =>
          (({
            where: whereSpy,
            getOne: getOneSpy,
            addSelect: addSelectSpy,
            subQuery: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            getQuery: jest.fn().mockReturnValue('query string'),
          } as unknown) as SelectQueryBuilder<UserEntity>),
      );
    });

    it('gets a profile for an unauthenticated user', async () => {
      const createQB = jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockImplementation(mockCreateQueryBuilder);

      expect(await userService.getProfile('test', undefined)).toBe<Profile>(
        mockProfile,
      );
      expect(createQB).toHaveBeenCalled();
      expect(whereSpy).toHaveBeenCalled();
      expect(getOneSpy).toHaveBeenCalled();
      // make sure we don't map "following" column if user is undefined
      expect(addSelectSpy).not.toHaveBeenCalled();
    });

    it('gets a profile for an authenticated user', async () => {
      const mockUser = new UserEntity();
      const createQB = jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockImplementation(mockCreateQueryBuilder);

      expect(await userService.getProfile('test', mockUser)).toBe<Profile>(
        mockProfile,
      );
      expect(createQB).toHaveBeenCalled();
      expect(whereSpy).toHaveBeenCalled();
      // make sure we map the "following" column
      expect(addSelectSpy).toHaveBeenCalled();
      expect(getOneSpy).toHaveBeenCalled();
    });
  });

  describe('followUser', () => {
    it('follows a user given a valid followeeUsername', async () => {
      const mockUser = new UserEntity();
      const mockFollowee = new UserEntity();
      const startingFollowersCount = 0;
      mockFollowee.followersCount = startingFollowersCount;
      const findUserByUsername = jest
        .spyOn(userRepository, 'findUserByUsername')
        .mockResolvedValue(mockFollowee);
      const followsRepositoryInsert = jest
        .spyOn(followsRepository, 'insert')
        .mockResolvedValue(new InsertResult());
      const userRepositorySave = jest
        .spyOn(userRepository, 'save')
        .mockImplementation(async followee => followee as UserEntity);

      const result = await userService.followUser(
        mockUser,
        'followee_username',
      );
      expect(findUserByUsername).toHaveBeenCalled();
      expect(followsRepositoryInsert).toHaveBeenCalled();
      expect(userRepositorySave).toHaveBeenCalled();
      // mockFollowee's followers count will have increased by 1 now
      expect(result.followersCount).toBe(startingFollowersCount + 1);
      expect(result.following).toBe(true);
    });
  });

  describe('unfollowUser', () => {
    it('unfollows a user given a valid followeeUsername', async () => {
      const mockUser = new UserEntity();
      const mockFollowee = new UserEntity();
      const startingFollowersCount = 1;
      mockFollowee.followersCount = startingFollowersCount;
      const findUserByUsername = jest
        .spyOn(userRepository, 'findUserByUsername')
        .mockResolvedValue(mockFollowee);
      const followsRepositoryDelete = jest
        .spyOn(followsRepository, 'delete')
        .mockResolvedValue(new DeleteResult());
      const userRepositorySave = jest
        .spyOn(userRepository, 'save')
        .mockImplementation(async followee => followee as UserEntity);

      const result = await userService.unfollowUser(
        mockUser,
        'followee_username',
      );
      expect(findUserByUsername).toHaveBeenCalled();
      expect(followsRepositoryDelete).toHaveBeenCalled();
      expect(userRepositorySave).toHaveBeenCalled();
      // mockFollowee's followers count will have decreased by 1 now
      expect(result.followersCount).toBe(startingFollowersCount - 1);
      expect(result.following).toBe(false);
    });
  });
});
