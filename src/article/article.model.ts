import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Profile } from '@/user/profile.model';

@ObjectType()
export class Article {
  @Field(type => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  body: string;

  @Field(type => [String])
  tagList: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ defaultValue: false, nullable: true })
  favorited?: boolean;

  @Field(type => Int)
  favoritesCount: number;

  /* 
    This field is mainly used to help resolve the "author" field down below.
    I don't want to expose user ids to the client. The usernames will be unique so we can fetch
    the author that way.
  */
  @Field()
  authorUsername: string;

  @Field(type => Profile)
  author: Profile;
}
