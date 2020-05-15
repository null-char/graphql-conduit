import { Profile } from '@/profile/profile.model';
import { ObjectType, Field } from '@nestjs/graphql';

export class ProfileAndToken {
  profile: Profile;
  token: string;
}
