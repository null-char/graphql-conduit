import { Resolver } from '@nestjs/graphql';
import { ArticleModel } from '@/article/article.model';

@Resolver(of => ArticleModel)
export class ArticleResolver {}
