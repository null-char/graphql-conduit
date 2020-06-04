import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/user/user.service';
import { RegisterUserInput } from '@/auth/input/register-user.input';
import { Profile } from '@/user/profile.model';
import { UserEntity } from '@/user/user.entity';
import { JwtPayload } from '@/auth/jwt-payload.type';
import bcrypt from 'bcrypt';
import { ProfileAndToken } from '@/auth/profile-and-token.type';
import { LoginUserInput } from '@/auth/input/login-user.input';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '@/user/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  public async register(
    registerUserInput: RegisterUserInput,
  ): Promise<Profile> {
    const { username, password, email } = registerUserInput;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await this.userService.createUser(
      username,
      salt,
      hashedPassword,
      email,
    );

    return {
      ...createdUser,
      following: false,
    };
  }

  public async login(loginUserInput: LoginUserInput): Promise<ProfileAndToken> {
    const { email, password } = loginUserInput;
    const user = await this.userRepository.findUserByEmail(email);

    if (await bcrypt.compare(password, user.password)) {
      const profileAndToken: ProfileAndToken = {
        profile: {
          ...user,
          following: false, // can't really follow yourself
        },
        token: this.getJwtToken(user),
      };

      return profileAndToken;
    }

    throw new UnauthorizedException('Invalid password');
  }

  private getJwtToken(user: UserEntity): string {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }
}
