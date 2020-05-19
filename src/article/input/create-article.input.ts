import { InputType, Field } from '@nestjs/graphql';
import { MinLength, IsOptional, Length } from 'class-validator';

@InputType()
export class CreateArticleInput {
  @MinLength(5)
  @Field()
  title: string;

  @IsOptional()
  @MinLength(15)
  @Field({ nullable: true })
  description: string;

  @Length(60, 8000)
  @Field()
  body: string;

  @Field(type => [String])
  tagList: string[];
}
