import { Entity, PrimaryColumn } from 'typeorm';

@Entity('follows')
export class FollowsEntity {
  @PrimaryColumn()
  follower: number; // id of user who is following followee

  @PrimaryColumn()
  followee: number; // id of followee who is being followed by follower
}
