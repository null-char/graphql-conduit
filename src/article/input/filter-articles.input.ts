import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsArray } from 'class-validator';
import { returnType as type } from '@/utils/return-type';

@InputType({
  description:
    'This input optionally accepts filtering by tags, author or favorited',
})
export class FilterArticlesInput {
  @Field(type([String]), { nullable: true })
  @IsOptional()
  @IsArray()
  tags: string[];

  @Field({ nullable: true })
  @IsOptional()
  author: string;

  @Field({ nullable: true })
  @IsOptional()
  favorited: string; // could be username
}
