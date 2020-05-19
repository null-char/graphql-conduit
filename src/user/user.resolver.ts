import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { Profile } from '@/user/profile.model';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/auth/guard/gql-auth.guard';
import { UserService } from '@/user/user.service';
import { GetUser } from '@/shared/get-user.decorator';
import { UserEntity } from '@/user/user.entity';
import { OptionalAuthGuard } from '@/auth/guard/optional-auth.guard';

@Resolver(of => Profile)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(returns => Profile, { name: 'profile' })
  @UseGuards(OptionalAuthGuard)
  public getProfile(
    @Args('username') username: string,
    @GetUser() user: UserEntity | undefined,
  ): Promise<Profile> {
    return this.userService.getProfile(username, user);
  }

  @Mutation(returns => Profile)
  @UseGuards(GqlAuthGuard)
  public async followUser(
    @Args('followeeUsername') followeeUsername: string,
    @GetUser() user: UserEntity,
  ): Promise<Profile> {
    return this.userService.followUser(user, followeeUsername);
  }

  @Mutation(returns => Profile)
  @UseGuards(GqlAuthGuard)
  public async unfollowUser(
    @Args('followeeUsername') followeeUsername: string,
    @GetUser() user: UserEntity,
  ): Promise<Profile> {
    return this.userService.unfollowUser(user, followeeUsername);
  }
}
