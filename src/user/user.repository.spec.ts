import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '@/user/user.repository';
import { UserEntity } from '@/user/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('findUserByUsername', () => {
    it('finds a user by username', async () => {
      const mockUser = new UserEntity();
      const findOne = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser);

      expect(await userRepository.findUserByUsername(mockUser.username)).toBe<
        UserEntity
      >(mockUser);
      expect(findOne).toHaveBeenCalled();
    });

    it('throws a NotFoundException if user does not exist', async () => {
      const mockUser = undefined;
      const findOne = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser);

      await expect(
        userRepository.findUserByUsername('fake'),
      ).rejects.toThrowError(NotFoundException);
      expect(findOne).toHaveBeenCalled();
    });
  });

  describe('findUserByEmail', () => {
    it('finds a user by email', async () => {
      const mockUser = new UserEntity();
      mockUser.email = 'test@test.com';
      const findOne = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser);

      expect(await userRepository.findUserByEmail(mockUser.email)).toBe<
        UserEntity
      >(mockUser);
      expect(findOne).toHaveBeenCalled();
    });

    it('throws a NotFoundException if user does not exist', async () => {
      const mockUser = undefined;
      const findOne = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser);

      await expect(
        userRepository.findUserByEmail('fake@fake.com'),
      ).rejects.toThrowError(NotFoundException);
      expect(findOne).toHaveBeenCalled();
    });
  });

  describe('findUserById', () => {
    it('finds a user by id', async () => {
      const mockUser = new UserEntity();
      mockUser.id = 1;
      const findOne = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser);

      expect(await userRepository.findUserById(mockUser.id)).toBe<UserEntity>(
        mockUser,
      );
      expect(findOne).toHaveBeenCalled();
    });

    it('throws a NotFoundException if user does not exist', async () => {
      const mockUser = undefined;
      const findOne = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser);

      await expect(userRepository.findUserById(8734982)).rejects.toThrowError(
        NotFoundException,
      );
      expect(findOne).toHaveBeenCalled();
    });
  });
});
