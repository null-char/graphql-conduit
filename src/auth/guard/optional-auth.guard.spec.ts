import { OptionalAuthGuard } from '@/auth/guard/optional-auth.guard';
import { UserEntity } from '@/user/user.entity';

const guard = new OptionalAuthGuard();

describe('OptionalAuthGuard', () => {
  it('is defined', () => {
    expect(guard).toBeDefined();
  });

  it('handles request appropriately and returns a user', () => {
    const mockUser = new UserEntity();

    expect(guard.handleRequest(undefined, mockUser, undefined)).toBe(mockUser);
  });
});
