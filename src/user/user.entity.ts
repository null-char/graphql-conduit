import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Check,
} from 'typeorm';
import { ArticleEntity } from '@/article/article.entity';
import { CommentEntity } from '@/comment/comment.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ default: null, nullable: true })
  bio: string;

  @Column({ default: null, nullable: true })
  image: string; // profile pic url

  @Column()
  salt: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 0 })
  @Check(`"followersCount" >= 0`)
  followersCount: number;

  @Column('boolean', { select: false, nullable: true })
  following: boolean;

  @OneToMany(
    /* istanbul ignore next */
    type => ArticleEntity,
    /* istanbul ignore next */
    article => article.author,
  )
  articles: ArticleEntity[];

  @OneToMany(
    /* istanbul ignore next */
    type => CommentEntity,
    /* istanbul ignore next */
    comment => comment.author,
  )
  comments: CommentEntity[];
}
