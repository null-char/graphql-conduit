import { Injectable } from '@nestjs/common';
import { GqlAuthGuard } from '@/auth/gql-auth.guard';

/**
 * Does not throw an exception if user is undefined and attaches a user object (could be undefined) to request.
 * Must ensure that validate method in JwtStrategy does not throw an error.
 *
 * @extends GqlAuthGuard
 */
@Injectable()
export class OptionalAuthGuard extends GqlAuthGuard {
  handleRequest(err, user, info) {
    return user;
  }
}
