import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { returnType as type } from '@/utils/return-type';

@InputType()
export class EditArticleInput {
  @Field(type(Int))
  id: number;

  @IsOptional()
  @Field({ nullable: true })
  title?: string;

  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsOptional()
  @Field({ nullable: true })
  body?: string;

  @IsOptional()
  @Field(type([String]), { nullable: true })
  tagList?: string[];
}
