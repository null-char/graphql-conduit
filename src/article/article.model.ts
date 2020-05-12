import { ObjectType, Field, Int } from '@nestjs/graphql';

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
}

/* 
{
  "article": {
    "slug": "how-to-train-your-dragon",
    "title": "How to train your dragon",
    "description": "Ever wonder how?",
    "body": "It takes a Jacobian",
    "tagList": ["dragons", "training"],
    "createdAt": "2016-02-18T03:22:56.637Z",
    "updatedAt": "2016-02-18T03:48:35.824Z",
    "favorited": false,
    "favoritesCount": 0,
    "author": {
      "username": "jake",
      "bio": "I work at statefarm",
      "image": "https://i.stack.imgur.com/xHWG8.jpg",
      "following": false
    }
  }
}
*/
