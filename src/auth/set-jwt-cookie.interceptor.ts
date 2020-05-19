import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProfileAndToken } from '@/auth/profile-and-token.type';
import { Response } from 'express';
import { Profile } from '@/user/profile.model';

@Injectable()
export class SetJwtCookieInterceptor implements NestInterceptor {
  intercept(
    ctx: ExecutionContext,
    next: CallHandler<ProfileAndToken>,
  ): Observable<Profile> {
    const gqlCtx = GqlExecutionContext.create(ctx);
    const res: Response = gqlCtx.getContext().res;

    return next.handle().pipe(
      map(data => {
        const token = data.token;
        res.cookie('accessToken', token, {
          expires: new Date(Date.now() + 43200 * 60000), // 30 days in milliseconds
          httpOnly: true,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        });
        return data.profile;
      }),
    );
  }
}
