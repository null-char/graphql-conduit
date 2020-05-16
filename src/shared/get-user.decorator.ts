import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '@/user/user.entity';
import { GqlExecutionContext } from '@nestjs/graphql';

// exported for testing
export const getUserFactory = (
  data: unknown,
  ctx: ExecutionContext,
): UserEntity => {
  const gqlCtx = GqlExecutionContext.create(ctx).getContext();
  return gqlCtx.req.user;
};

export const GetUser = createParamDecorator<unknown, any, UserEntity>(
  getUserFactory,
);
