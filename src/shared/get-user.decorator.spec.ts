import { getUserFactory } from '@/shared/get-user.decorator';
import { ExecutionContext } from '@nestjs/common';
import { UserEntity } from '@/user/user.entity';

const mockGqlCtx = {
  getContext: jest.fn().mockReturnValue({ req: { user: new UserEntity() } }),
};

jest.mock('@nestjs/graphql', () => {
  class MockGqlExecutionContext {
    static create(ctx: ExecutionContext) {
      return mockGqlCtx;
    }
  }

  return {
    ...jest.requireActual('@nestjs/graphql'),
    GqlExecutionContext: MockGqlExecutionContext,
  };
});

describe('@GetUser decorator', () => {
  it('is defined', () => {
    expect(getUserFactory).toBeDefined();
  });

  it('grabs user from request inside graphql context', () => {
    const actual = getUserFactory(undefined, {} as ExecutionContext);
    const expected = mockGqlCtx.getContext().req.user;

    expect(actual).toBeDefined();
    expect(actual).toMatchObject<UserEntity>(expected);
    expect(mockGqlCtx.getContext).toHaveBeenCalled();
  });
});
