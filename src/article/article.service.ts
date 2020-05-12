import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from '@/article/article.entity';
import { Repository } from 'typeorm';
import { Article } from '@/article/article.model';
import { CreateArticleInput } from '@/article/create-article.input';
import { EditArticleInput } from '@/article/edit-article.input';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private articleRepository: Repository<ArticleEntity>,
  ) {}

  public async getArticle(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne(id);

    return {
      ...article,
      favorited: false,
    };
  }

  public async getArticlesTaggedWith(tags: string[]): Promise<Article[]> {
    const qb = this.articleRepository.createQueryBuilder('article');
    qb.where('article.tagList LIKE (:tags)', { tags: `%${tags}%` });

    return await qb.getMany();
  }

  public async createArticle(
    createArticleInput: CreateArticleInput,
  ): Promise<Article> {
    const createdArticle = await this.articleRepository.save(
      createArticleInput,
    );

    return {
      ...createdArticle,
      favorited: false,
    };
  }

  public async editArticle(
    editArticleInput: EditArticleInput,
  ): Promise<Article> {
    const updatedArticle = await this.articleRepository.findOne(
      editArticleInput.id,
    );

    for (const key in editArticleInput) {
      if (editArticleInput[key]) updatedArticle[key] = editArticleInput[key];
    }

    return await this.articleRepository.save(updatedArticle);
  }
}
