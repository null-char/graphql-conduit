import { SetJwtCookieInterceptor } from '@/auth/set-jwt-cookie.interceptor';
import { of } from 'rxjs';
import { ProfileAndToken } from '@/auth/profile-and-token.type';
import { Profile } from '@/user/profile.model';
import { ExecutionContext, CallHandler } from '@nestjs/common';

const mockGqlCtx = {
  getContext: jest.fn().mockReturnValue({ res: { cookie: jest.fn() } }),
};

// apparently jest doesn't properly automock decorator functions
jest.mock('@nestjs/graphql', () => {
  //! need to declare mock class in this scope
  class MockGqlExecutionContext {
    static create() {
      return mockGqlCtx;
    }
  }

  // only override the GqlExecutionContext class
  return {
    ...jest.requireActual('@nestjs/graphql'),
    GqlExecutionContext: MockGqlExecutionContext,
  };
});

const interceptor = new SetJwtCookieInterceptor();
const profileAndToken: ProfileAndToken = {
  profile: new Profile(),
  token: 'token',
};
const mockCallHandler: CallHandler<ProfileAndToken> = {
  handle: jest.fn().mockReturnValue(of(profileAndToken)),
};

describe('SetJwtCookieInterceptor', () => {
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('intercepts and sets cookie correctly', async () => {
    // we don't really care about passing a valid mocked ExecutionContext
    const observable = interceptor.intercept(
      {} as ExecutionContext,
      mockCallHandler,
    );
    let actualValue: Profile;
    observable.subscribe({
      next(val) {
        actualValue = val;
      },
    });

    expect(actualValue).toMatchObject<Profile>(new Profile());
    expect(mockCallHandler.handle).toHaveBeenCalled();
    expect(mockGqlCtx.getContext().res.cookie).toHaveBeenCalled();
  });
});
