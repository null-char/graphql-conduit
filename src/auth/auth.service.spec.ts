import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/auth/auth.service';
import { UserService } from '@/user/user.service';
import { UserRepository } from '@/user/user.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FollowsEntity } from '@/user/follows.entity';
import { Repository } from 'typeorm';
import { RegisterUserInput } from '@/auth/input/register-user.input';
import { Profile } from '@/user/profile.model';
import { UserEntity } from '@/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { LoginUserInput } from '@/auth/input/login-user.input';
import { ProfileAndToken } from '@/auth/profile-and-token.type';
import bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('@nestjs/jwt', () => {
  class MockJwtService {
    sign(
      payload: string | object | Buffer,
      options?: { [key: string]: any },
    ): string {
      return 'token';
    }
  }

  return {
    ...jest.requireActual('@nestjs/jwt'),
    JwtService: MockJwtService,
  };
});

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        JwtService,
        UserRepository,
        {
          provide: getRepositoryToken(FollowsEntity),
          useClass: class MockRepository extends Repository<FollowsEntity> {},
        },
      ],
    }).compile();

    authService = moduleFixture.get<AuthService>(AuthService);
    userService = moduleFixture.get<UserService>(UserService);
    userRepository = moduleFixture.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('register', () => {
    it('registers a user', async () => {
      const mockInput: RegisterUserInput = {
        email: 'test@test.com',
        username: 'test',
        password: 'password',
      };
      const mockCreatedEntity = new UserEntity();
      mockCreatedEntity.username = mockInput.username;
      const mockResult = new Profile();
      mockResult.username = mockCreatedEntity.username;
      mockResult.following = false;
      const createUser = jest
        .spyOn(userService, 'createUser')
        .mockResolvedValue(mockCreatedEntity);

      expect(await authService.register(mockInput)).toMatchObject<Profile>(
        mockResult,
      );
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(createUser).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('successfully logins a user given valid credentials', async () => {
      const mockInput: LoginUserInput = {
        email: 'test@test.com',
        password: 'password',
      };
      const mockUserEntity = new UserEntity();
      const findUserByEmail = jest
        .spyOn(userRepository, 'findUserByEmail')
        .mockResolvedValue(mockUserEntity);
      const mockToken = 'token';
      const mockResult: ProfileAndToken = {
        profile: {
          ...mockUserEntity,
          following: false,
        },
        token: mockToken,
      };
      const bcryptCompare = jest
        .spyOn(bcrypt, 'compare')
        .mockResolvedValue(true);

      expect(await authService.login(mockInput)).toMatchObject<ProfileAndToken>(
        mockResult,
      );
      expect(findUserByEmail).toHaveBeenCalled();
      expect(bcryptCompare).toHaveBeenCalled();
    });

    it('throws an UnauthorizedException error if invalid credentials are provided', async () => {
      const mockInput: LoginUserInput = {
        email: 'test@test.com',
        password: 'ilikeass69',
      };
      const mockUserEntity = new UserEntity();
      const findUserByEmail = jest
        .spyOn(userRepository, 'findUserByEmail')
        .mockResolvedValue(mockUserEntity);
      const bcryptCompare = jest
        .spyOn(bcrypt, 'compare')
        .mockResolvedValue(false);

      // should throw an error since compare returns false
      await expect(authService.login(mockInput)).rejects.toThrowError(
        UnauthorizedException,
      );
      expect(findUserByEmail).toHaveBeenCalled();
      expect(bcryptCompare).toHaveBeenCalled();
    });
  });
});
