import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { AuthModule } from '@/auth/auth.module';
import { ArticleModule } from '@/article/article.module';
import { CommentModule } from '@/comment/comment.module';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      context: ({ req, res }) => ({ req, res }),
    }),
    ArticleModule,
    AuthModule,
    CommentModule,
    UserModule,
  ],
})
export class AppModule {}
