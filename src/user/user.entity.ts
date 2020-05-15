import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { ArticleEntity } from '@/article/article.entity';
import { CommentEntity } from '@/comment/comment.entity';

@Entity('users')
@Unique(['username', 'email'])
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  email: string;

  @Column()
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

  @OneToMany(
    type => ArticleEntity,
    article => article.author,
  )
  articles: ArticleEntity[];

  @OneToMany(
    type => CommentEntity,
    comment => comment.author,
  )
  comments: CommentEntity[];
}
