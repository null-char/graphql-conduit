import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from '@/article/article.entity';
import { Article } from '@/article/article.model';
import { CreateArticleInput } from '@/article/create-article.input';
import { EditArticleInput } from '@/article/edit-article.input';
import { UserEntity } from '@/user/user.entity';
import { ArticleRepository } from '@/article/article.repository';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleRepository)
    private articleRepository: ArticleRepository,
  ) {}

  public async getArticle(id: number): Promise<Article> {
    const article = await this.articleRepository.findArticleById(id);

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
    user: UserEntity,
  ): Promise<Article> {
    const article = {
      ...createArticleInput,
      authorId: user.id,
    };
    const createdArticle = await this.articleRepository.save(article);

    return {
      ...createdArticle,
      favorited: false,
    };
  }

  public async editArticle(
    editArticleInput: EditArticleInput,
    user: UserEntity,
  ): Promise<Article> {
    const updatedArticle = await this.articleRepository.findArticleById(
      editArticleInput.id,
    );
    if (updatedArticle.authorId !== user.id)
      throw new ForbiddenException('You do not own this resource');

    for (const key in editArticleInput) {
      if (editArticleInput[key]) updatedArticle[key] = editArticleInput[key];
    }

    return await this.articleRepository.save(updatedArticle);
  }
}
