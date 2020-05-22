import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateCommentInput {
  @Field(type => Int)
  articleId: number;

  @Field()
  body: string;
}
