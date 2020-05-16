import * as dotenv from 'dotenv';
dotenv.config();
import {
  INestApplication,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { GraphQLModule } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ApolloServerTestClient,
  createTestClient,
} from 'apollo-server-testing';
import gql from 'graphql-tag';
import { TestingOrmConfig } from '@/config/testing-orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '@/profile/profile.model';
import { RegisterUserInput } from '@/auth/input/register-user.input';
import { LoginUserInput } from '@/auth/input/login-user.input';
import { SetJwtCookieInterceptor } from '@/auth/set-jwt-cookie.interceptor';
import { ProfileAndToken } from '@/auth/profile-and-token.type';
import { AppModule } from '@/app.module';

const mockSetJwtCookieInterceptor: NestInterceptor = {
  intercept: (
    context: ExecutionContext,
    next: CallHandler<ProfileAndToken>,
  ) => {
    return next.handle().pipe(map(data => data.profile));
  },
};

describe('AuthModule', () => {
  let app: INestApplication;
  let apolloClient: ApolloServerTestClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(TestingOrmConfig), AppModule],
      providers: [SetJwtCookieInterceptor],
    })
      .overrideInterceptor(SetJwtCookieInterceptor)
      .useValue(mockSetJwtCookieInterceptor)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const gqlModule: GraphQLModule = moduleFixture.get<GraphQLModule>(
      GraphQLModule,
    );
    // apolloServer is a protected field on GraphQLModule. Cast to any to get it.
    apolloClient = createTestClient((gqlModule as any).apolloServer);
  });

  describe('Registration', () => {
    const REGISTER_MUTATION = gql`
      mutation registerUser($createUserInput: CreateUserInput!) {
        registerUser(createUserInput: $createUserInput) {
          username
          bio
          image
          following
        }
      }
    `;

    it('registers a user successfully', async () => {
      const { mutate } = apolloClient;
      const createUserInput: RegisterUserInput = {
        username: 'test',
        password: 'password',
        email: 'test@test.com',
      };
      const result = await mutate({
        mutation: REGISTER_MUTATION,
        variables: {
          createUserInput,
        },
      });

      expect(result.data).toBeDefined();
      expect(result.errors).toBeUndefined();

      const profile = result.data.registerUser;
      expect(profile).toMatchObject<Profile>(new Profile()); // make sure we get the expected structure
      expect(profile.username).toBe(createUserInput.username);
      expect(profile.following).toBe(false);
    });

    it('throws a ConflictException if user with the same name already exists', async () => {
      const { mutate } = apolloClient;
      const result = await mutate({
        mutation: REGISTER_MUTATION,
        variables: {
          createUserInput: {
            username: 'test',
            password: 'short',
            email: 'anotheruser@gmail.com',
          },
        },
      });

      expect(result.data).toBeNull();
      expect(result.errors).toBeDefined();

      const exception = result.errors[0].extensions.exception;
      expect(exception.status).toBe(409);
    });

    it('throws a ConflictException if user with the same email already exists', async () => {
      const { mutate } = apolloClient;
      const result = await mutate({
        mutation: REGISTER_MUTATION,
        variables: {
          createUserInput: {
            username: 'unique',
            password: 'password',
            email: 'test@test.com',
          },
        },
      });
      expect(result.data).toBeNull();
      expect(result.errors).toBeDefined();

      const exception = result.errors[0].extensions.exception;
      expect(exception.status).toBe(409);
    });
  });

  describe('Login', () => {
    const LOGIN_MUTATION = gql`
      mutation loginUser($loginUserInput: LoginUserInput!) {
        loginUser(loginUserInput: $loginUserInput) {
          username
          bio
          image
          following
        }
      }
    `;

    it('logs in an existing user', async () => {
      const { mutate } = apolloClient;
      const loginUserInput: LoginUserInput = {
        email: 'test@test.com',
        password: 'password',
      };
      const result = await mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          loginUserInput,
        },
      });

      expect(result.data).toBeDefined();
      expect(result.errors).toBeUndefined();

      expect(result.data.loginUser).toMatchObject<Profile>(new Profile());
    });

    it('throws a NotFoundException if user does not exist', async () => {
      const { mutate } = apolloClient;
      const loginUserInput: LoginUserInput = {
        email: 'user@notfound.com',
        password: 'ilikeass69',
      };
      const result = await mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          loginUserInput,
        },
      });

      expect(result.data).toBeNull();
      expect(result.errors).toBeDefined();

      const exception = result.errors[0].extensions.exception;
      expect(exception.status).toBe(404);
    });

    it('throws an UnauthorizedException if incorrect password is provided', async () => {
      const { mutate } = apolloClient;
      const loginUserInput: LoginUserInput = {
        email: 'test@test.com',
        password: 'wtfisthepassword',
      };
      const result = await mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          loginUserInput,
        },
      });

      expect(result.data).toBeNull();
      expect(result.errors).toBeDefined();

      const exception = result.errors[0].extensions.exception;
      expect(exception.status).toBe(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
