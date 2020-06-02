import { ObjectType, Field, Int } from '@nestjs/graphql';
import { returnType as type } from '@/utils/return-type';

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

  @Field(type(Int))
  followersCount: number;
}
