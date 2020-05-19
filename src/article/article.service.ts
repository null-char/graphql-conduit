import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from '@/article/article.model';
import { CreateArticleInput } from '@/article/input/create-article.input';
import { EditArticleInput } from '@/article/input/edit-article.input';
import { UserEntity } from '@/user/user.entity';
import { ArticleRepository } from '@/article/article.repository';
import { FilterArticlesInput } from '@/article/input/filter-articles.input';
import { FavoritesEntity } from '@/article/favorites.entity';
import { ArticleEntity } from '@/article/article.entity';
import { Profile } from '@/user/profile.model';
import { UserService } from '@/user/user.service';
import { UserRepository } from '@/user/user.repository';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleRepository)
    private articleRepository: ArticleRepository,
    @InjectRepository(FavoritesEntity)
    private favoritesRepository: Repository<FavoritesEntity>,
    private userService: UserService,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  public async getArticle(
    id: number,
    user: UserEntity | undefined,
  ): Promise<Article> {
    if (!user) {
      /* 
        We'll just return favorited field as null for guest users.
        We expect the client to not allow guest users to favorite articles. Nevertheless, we'll set up a guard for the favoriteArticle mutation.
      */
      return this.articleRepository.findArticleById(id);
    }

    const qb = this.articleRepository.createQueryBuilder('article');
    qb.where({ id });
    this.addFavoritedToArticle(qb, user);

    const article = await qb.getOne();
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  public async getArticles(
    filterArticlesInput: FilterArticlesInput,
    user: UserEntity | undefined,
  ): Promise<Article[]> {
    const qb = this.articleRepository.createQueryBuilder('article');
    const q = filterArticlesInput;

    qb.where('1 = 1');

    if (q) {
      if (q.author) {
        qb.andWhere('article.authorUsername = :username', {
          username: q.author,
        });
      }

      if (q.tags) {
        qb.andWhere('article.tagList LIKE (:tags)', { tags: `%${q.tags}%` });
      }

      if (q.favorited) {
        const user = await this.userRepository.findUserByUsername(q.favorited);

        const favoritedArticles = await this.favoritesRepository.find({
          where: { favoritedBy: user.id },
        });
        const ids = favoritedArticles.map(f => f.articleId);

        qb.andWhereInIds(ids);
      }
    }

    qb.orderBy('article.createdAt', 'DESC');
    // only add favorited field if user is authenticated
    if (user) {
      this.addFavoritedToArticle(qb, user);
    }

    return qb.getMany();
  }

  public async getAuthor(
    article: Article,
    user: UserEntity | undefined,
  ): Promise<Profile> {
    return this.userService.getProfile(article.authorUsername, user);
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
