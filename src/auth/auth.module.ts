import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '@/user/user.module';
import { AuthService } from '@/auth/auth.service';
import { JwtStrategy } from '@/auth/jwt.strategy';
import { SetJwtCookieInterceptor } from '@/auth/set-jwt-cookie.interceptor';
import { GqlAuthGuard } from '@/auth/gql-auth.guard';
import { AuthResolver } from '@/auth/auth.resolver';
import { OptionalAuthGuard } from '@/auth/optional-auth.guard';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  providers: [
    AuthResolver,
    AuthService,
    JwtStrategy,
    SetJwtCookieInterceptor,
    GqlAuthGuard,
    OptionalAuthGuard,
  ],
  exports: [GqlAuthGuard, OptionalAuthGuard],
})
export class AuthModule {}
