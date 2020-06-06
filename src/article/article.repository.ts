import { EntityRepository, Repository } from 'typeorm';
import { ArticleEntity } from '@/article/article.entity';
import { NotFoundException } from '@nestjs/common';

@EntityRepository(ArticleEntity)
export class ArticleRepository extends Repository<ArticleEntity> {
  public async findArticleById(id: number): Promise<ArticleEntity> {
    const article = await this.findOne(id);
    if (!article) throw new NotFoundException('Article not found');
    article.favorited = null;
    return article;
  }
}
