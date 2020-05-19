/* istanbul ignore file */

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(ctx: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(ctx).getContext();
    return gqlCtx.req;
  }
}
