import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { Article } from '@/article/article.model';
import { ArticleService } from '@/article/article.service';
import { CreateArticleInput } from '@/article/create-article.input';
import { EditArticleInput } from '@/article/edit-article.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/auth/gql-auth.guard';
import { GetUser } from '@/shared/get-user.decorator';
import { UserEntity } from '@/user/user.entity';

@Resolver(of => Article)
export class ArticleResolver {
  constructor(private articleService: ArticleService) {}

  @Query(returns => Article, { name: 'article' })
  public async getArticle(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Article> {
    return this.articleService.getArticle(id);
  }

  @Query(returns => [Article], { name: 'articlesTaggedWith' })
  public async getArticlesTaggedWith(
    @Args('tags', { type: () => [String] }) tags: string[],
  ): Promise<Article[]> {
    return this.articleService.getArticlesTaggedWith(tags);
  }

  @Mutation(returns => Article)
  @UseGuards(GqlAuthGuard)
  public async createArticle(
    @Args('createArticleInput', { type: () => CreateArticleInput })
    createArticleInput: CreateArticleInput,
    @GetUser() user: UserEntity,
  ): Promise<Article> {
    return this.articleService.createArticle(createArticleInput, user);
  }

  @Mutation(returns => Article)
  @UseGuards(GqlAuthGuard)
  public async editArticle(
    @Args('editArticleInput', { type: () => EditArticleInput })
    editArticleInput: EditArticleInput,
    @GetUser() user: UserEntity,
  ): Promise<Article> {
    return this.articleService.editArticle(editArticleInput, user);
  }
}
