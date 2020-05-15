import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleService } from '@/article/article.service';
import { AuthModule } from '@/auth/auth.module';
import { ArticleResolver } from '@/article/article.resolver';
import { ArticleRepository } from '@/article/article.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleRepository]), AuthModule],
  providers: [ArticleService, ArticleResolver],
})
export class ArticleModule {}
