import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/user/user.service';
import { RegisterUserInput } from '@/auth/input/register-user.input';
import { Profile } from '@/profile/profile.model';
import { UserEntity } from '@/user/user.entity';
import { JwtPayload } from '@/auth/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { ProfileAndToken } from '@/auth/profile-and-token.type';
import { LoginUserInput } from '@/auth/input/login-user.input';
import { UserRepository } from '@/user/user.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    @InjectRepository(UserRepository) private userRepository: UserRepository,
  ) {}

  public async register(createUserInput: RegisterUserInput): Promise<Profile> {
    const { username, password, email } = createUserInput;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await this.userService.createUser(
      username,
      salt,
      hashedPassword,
      email,
    );

    return {
      username: createdUser.username,
      bio: createdUser.bio,
      image: createdUser.image,
      following: false, // can't really follow yourself
    };
  }

  public async login(loginUserInput: LoginUserInput): Promise<ProfileAndToken> {
    const { email, password } = loginUserInput;
    const user = await this.userRepository.findUserByEmail(email);

    if (user.password === (await bcrypt.hash(password, user.salt))) {
      const profileAndToken: ProfileAndToken = {
        profile: {
          username: user.username,
          bio: user.bio,
          following: false, // can't really follow yourself
          image: user.image,
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
