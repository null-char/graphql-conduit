import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { Article } from '@/article/article.model';
import { ArticleService } from '@/article/article.service';
import { CreateArticleInput } from '@/article/create-article.input';
import { EditArticleInput } from '@/article/edit-article.input';

@Resolver(of => Article)
export class ArticleResolver {
  constructor(private articleService: ArticleService) {}

  @Query(returns => Article, {name: 'article'})
  public async getArticle(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Article> {
    return this.articleService.getArticle(id);
  }

  @Query(returns => [Article], {name: 'articlesTaggedWith'})
  public async getArticlesTaggedWith(
    @Args('tags', { type: () => [String] }) tags: string[],
  ): Promise<Article[]> {
    return this.articleService.getArticlesTaggedWith(tags);
  }

  @Mutation(returns => Article)
  public async createArticle(createArticleInput: CreateArticleInput): Promise<Article> {
    return this.articleService.createArticle(createArticleInput);
  };

  @Mutation(returns => Article)
  public async editArticle(editArticleInput: EditArticleInput): Promise<Article> {
    return this.articleService.editArticle(editArticleInput);
  }
}
