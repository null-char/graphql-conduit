import {
  Resolver,
  Query,
  Args,
  Int,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Article } from '@/article/article.model';
import { ArticleService } from '@/article/article.service';
import { CreateArticleInput } from '@/article/input/create-article.input';
import { EditArticleInput } from '@/article/input/edit-article.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/auth/guard/gql-auth.guard';
import { GetUser } from '@/shared/get-user.decorator';
import { UserEntity } from '@/user/user.entity';
import { FilterArticlesInput } from '@/article/input/filter-articles.input';
import { OptionalAuthGuard } from '@/auth/guard/optional-auth.guard';
import { Profile } from '@/user/profile.model';
import { returnType as returns, returnType as type } from '@/utils/return-type';

@Resolver(Article)
export class ArticleResolver {
  constructor(private articleService: ArticleService) {}

  @Query(returns(Article), { name: 'article' })
  @UseGuards(OptionalAuthGuard)
  public async getArticle(
    @Args('id', { type: type(Int) }) id: number,
    @GetUser() user: UserEntity | undefined,
  ): Promise<Article> {
    return this.articleService.getArticle(id, user);
  }

  @Query(returns([Article]), { name: 'articles' })
  @UseGuards(OptionalAuthGuard)
  public async getArticles(
    @Args('filterArticlesInput', {
      type: type(FilterArticlesInput),
      nullable: true,
    })
    filterArticlesInput: FilterArticlesInput,
    @GetUser() user: UserEntity | undefined,
  ): Promise<Article[]> {
    return this.articleService.getArticles(filterArticlesInput, user);
  }

  @ResolveField('author', type(Profile))
  @UseGuards(OptionalAuthGuard)
  public async getAuthor(
    @Parent() article: Article,
    @GetUser() user: UserEntity | undefined,
  ): Promise<Profile> {
    return this.articleService.getAuthor(article, user);
  }

  @Mutation(returns(Article))
  @UseGuards(GqlAuthGuard)
  public async createArticle(
    @Args('createArticleInput', { type: type(CreateArticleInput) })
    createArticleInput: CreateArticleInput,
    @GetUser() user: UserEntity,
  ): Promise<Article> {
    return this.articleService.createArticle(createArticleInput, user);
  }

  @Mutation(returns(Article))
  @UseGuards(GqlAuthGuard)
  public async editArticle(
    @Args('editArticleInput', { type: type(EditArticleInput) })
    editArticleInput: EditArticleInput,
    @GetUser() user: UserEntity,
  ): Promise<Article> {
    return this.articleService.editArticle(editArticleInput, user);
  }

  @Mutation(returns(Article))
  @UseGuards(GqlAuthGuard)
  public async favoriteArticle(
    @Args('id', { type: type(Int) }) id: number,
    @GetUser() user: UserEntity,
  ): Promise<Article> {
    return this.articleService.favoriteArticle(id, user);
  }

  @Mutation(returns(Article))
  @UseGuards(GqlAuthGuard)
  public async unfavoriteArticle(
    @Args('id', { type: type(Int) }) id: number,
    @GetUser() user: UserEntity,
  ): Promise<Article> {
    return this.articleService.unfavoriteArticle(id, user);
  }
}
