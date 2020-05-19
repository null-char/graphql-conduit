import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Profile } from '@/user/profile.model';
import { RegisterUserInput } from '@/auth/input/register-user.input';
import { AuthService } from '@/auth/auth.service';
import { LoginUserInput } from '@/auth/input/login-user.input';
import { ProfileAndToken } from '@/auth/profile-and-token.type';
import { UseInterceptors } from '@nestjs/common';
import { SetJwtCookieInterceptor } from '@/auth/set-jwt-cookie.interceptor';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(returns => Profile)
  public async registerUser(
    @Args('createUserInput', { type: () => RegisterUserInput })
    createUserInput: RegisterUserInput,
  ): Promise<Profile> {
    return this.authService.register(createUserInput);
  }

  @Mutation(returns => Profile)
  @UseInterceptors(SetJwtCookieInterceptor)
  public async loginUser(
    @Args('loginUserInput', { type: () => LoginUserInput })
    loginUserInput: LoginUserInput,
  ): Promise<ProfileAndToken> {
    return this.authService.login(loginUserInput);
  }
}
