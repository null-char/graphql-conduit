import { InputType, Field, Int } from '@nestjs/graphql';
import { returnType as type } from '@/utils/return-type';

@InputType()
export class CreateCommentInput {
  @Field(type(Int))
  articleId: number;

  @Field()
  body: string;
}
