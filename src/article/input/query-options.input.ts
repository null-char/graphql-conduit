import { InputType, Field, Int } from '@nestjs/graphql';
import { returnType as type } from '@/utils/return-type';

@InputType()
export class QueryOptionsInput {
  @Field(type(Int))
  limit: number;

  @Field(type(Int))
  offset: number;
}
