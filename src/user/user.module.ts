import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '@/user/user.service';
import { FollowsEntity } from '@/user/follows.entity';
import { AuthModule } from '@/auth/auth.module';
import { UserResolver } from '@/user/user.resolver';
import { UserRepository } from '@/user/user.repository';

/* 
  Had to resort to forwardRef() here since we need the auth guard in user.resolver.ts
  Is there a better way of doing this?
*/
@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository, FollowsEntity]),
    forwardRef(() => AuthModule),
  ],
  providers: [UserService, UserResolver],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
