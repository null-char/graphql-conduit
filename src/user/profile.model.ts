import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Profile {
  @Field()
  username: string;

  @Field({ nullable: true })
  bio: string;

  @Field({ nullable: true })
  image: string | null;

  @Field()
  following: boolean;

  @Field(type => Int)
  followersCount: number;
}
