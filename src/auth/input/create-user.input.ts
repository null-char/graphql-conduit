import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @MinLength(3)
  username: string;

  @Field()
  @MinLength(8)
  password: string;

  @Field()
  @IsEmail()
  email: string;
}
