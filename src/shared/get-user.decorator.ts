/* istanbul ignore file */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '@/user/user.entity';
import { GqlExecutionContext } from '@nestjs/graphql';

export const GetUser = createParamDecorator<unknown, any, UserEntity>(
  (data: unknown, ctx: ExecutionContext): UserEntity => {
    const gqlCtx = GqlExecutionContext.create(ctx).getContext();
    return gqlCtx.req.user;
  },
);
