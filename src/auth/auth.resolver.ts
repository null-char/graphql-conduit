import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Profile } from '@/user/profile.model';
import { RegisterUserInput } from '@/auth/input/register-user.input';
import { AuthService } from '@/auth/auth.service';
import { LoginUserInput } from '@/auth/input/login-user.input';
import { ProfileAndToken } from '@/auth/profile-and-token.type';
import { UseInterceptors } from '@nestjs/common';
import { SetJwtCookieInterceptor } from '@/auth/set-jwt-cookie.interceptor';
import { returnType as returns, returnType as type } from '@/utils/return-type';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(returns(Profile))
  public async registerUser(
    @Args('createUserInput', { type: type(RegisterUserInput) })
    registerUserInput: RegisterUserInput,
  ): Promise<Profile> {
    return this.authService.register(registerUserInput);
  }

  @Mutation(returns(Profile))
  @UseInterceptors(SetJwtCookieInterceptor)
  public async loginUser(
    @Args('loginUserInput', { type: type(LoginUserInput) })
    loginUserInput: LoginUserInput,
  ): Promise<ProfileAndToken> {
    return this.authService.login(loginUserInput);
  }
}
