import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Profile } from '@/user/profile.model';
import { returnType as type } from '@/utils/return-type';

@ObjectType()
export class Comment {
  @Field(type(Int))
  id: number;

  @Field(type(Int))
  articleId: number;

  @Field()
  authorUsername: string;

  @Field()
  body: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(type(Profile))
  author: Profile;
}
