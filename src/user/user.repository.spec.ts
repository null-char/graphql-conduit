import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '@/user/user.repository';
import { UserEntity } from '@/user/user.entity';
import { NotFoundException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestingOrmConfig } from '@/config/testing-orm.config';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockUser: UserEntity;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(TestingOrmConfig),
        TypeOrmModule.forFeature([UserRepository]),
      ],
      providers: [UserRepository],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);

    // make a mock user to test against
    const mockUserDetails = {
      username: 'test',
      password: 'password',
      salt: 'salt',
      email: 'test@test.com',
    };
    mockUser = await userRepository.save(mockUserDetails);
  });

  describe('findUserByUsername', () => {
    it('finds a user by username', async () => {
      const result = await userRepository.findUserByUsername(mockUser.username);

      expect(result).toMatchObject<UserEntity>(mockUser);
    });

    it('throws a NotFoundException if user does not exist', async () => {
      try {
        const result = await userRepository.findUserByUsername('fake');
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('findUserByEmail', () => {
    it('finds a user by email', async () => {
      const result = await userRepository.findUserByEmail(mockUser.email);

      expect(result).toMatchObject<UserEntity>(mockUser);
    });

    it('throws a NotFoundException if user does not exist', async () => {
      try {
        const result = await userRepository.findUserByEmail('fake@fake.com');
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('findUserById', () => {
    it('finds a user by id', async () => {
      const result = await userRepository.findUserById(1);

      expect(result).toMatchObject<UserEntity>(mockUser);
    });

    it('throws a NotFoundException if user does not exist', async () => {
      try {
        const result = await userRepository.findUserById(8734982);
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
