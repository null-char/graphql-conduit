import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Favorite {
  @Field(type => Int)
  articleId: number;

  @Field(type => Int)
  userId: number;
}
