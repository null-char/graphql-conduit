import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from '@/auth/auth.resolver';
import { AuthService } from '@/auth/auth.service';
import { UserRepository } from '@/user/user.repository';
import { UserService } from '@/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserInput } from '@/auth/input/register-user.input';
import { Profile } from '@/user/profile.model';
import { LoginUserInput } from '@/auth/input/login-user.input';
import { ProfileAndToken } from '@/auth/profile-and-token.type';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FollowsEntity } from '@/user/follows.entity';
import { Repository } from 'typeorm';

jest.mock('@nestjs/jwt', () => {
  class MockJwtService {
    sign(payload: string | object | Buffer, options?: any): string {
      return 'token';
    }
  }

  return {
    ...jest.requireActual('@nestjs/jwt'),
    JwtService: MockJwtService,
  };
});

describe('AuthResolver', () => {
  let authResolver: AuthResolver;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        AuthService,
        UserRepository,
        UserService,
        JwtService,
        {
          provide: getRepositoryToken(FollowsEntity),
          useClass: class MockRepository extends Repository<FollowsEntity> {},
        },
      ],
    }).compile();

    authResolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('resolves "registerUser" mutation', async () => {
    const mockProfile = new Profile();
    const mockRegisterUserInput: RegisterUserInput = {
      email: 'test@test.com',
      password: 'password',
      username: 'test',
    };

    const serviceRegister = jest
      .spyOn(authService, 'register')
      .mockResolvedValue(mockProfile);

    expect(await authResolver.registerUser(mockRegisterUserInput)).toBe<
      Profile
    >(mockProfile);
    expect(serviceRegister).toHaveBeenCalled();
  });

  it('resolves "loginUser" mutation', async () => {
    const mockProfileAndToken = new ProfileAndToken();
    const mockLoginUserInput: LoginUserInput = {
      email: 'test@test.com',
      password: 'password',
    };

    const serviceLogin = jest
      .spyOn(authService, 'login')
      .mockResolvedValue(mockProfileAndToken);

    expect(await authResolver.loginUser(mockLoginUserInput)).toBe<
      ProfileAndToken
    >(mockProfileAndToken);
    expect(serviceLogin).toHaveBeenCalled();
  });
});
