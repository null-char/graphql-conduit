import { GqlAuthGuard } from '@/auth/guard/gql-auth.guard';
import { ExecutionContext } from '@nestjs/common';

const guard = new GqlAuthGuard();
const mockGqlCtx = {
  getContext: jest.fn().mockReturnValue({ req: 'request object' }),
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

describe('GqlAuthGuard', () => {
  it('is defined', () => {
    expect(guard).toBeDefined();
    // make sure this method exists
    expect(guard.getRequest).toBeDefined();
  });

  it('correctly returns the request object from GraphQL context', () => {
    const actual = guard.getRequest({} as ExecutionContext);

    expect(mockGqlCtx.getContext).toHaveBeenCalled();
    expect(actual).toBe(mockGqlCtx.getContext().req);
  });
});
