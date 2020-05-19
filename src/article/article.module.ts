import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleService } from '@/article/article.service';
import { AuthModule } from '@/auth/auth.module';
import { ArticleResolver } from '@/article/article.resolver';
import { ArticleRepository } from '@/article/article.repository';
import { FavoritesEntity } from '@/article/favorites.entity';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticleRepository, FavoritesEntity]),
    UserModule,
    AuthModule,
  ],
  providers: [ArticleService, ArticleResolver],
})
export class ArticleModule {}
