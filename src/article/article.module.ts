import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from '@/article/article.entity';
import { ArticleService } from '@/article/article.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity])],
  providers: [ArticleService],
})
export class ArticleModule {}
