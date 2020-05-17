import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { CommentEntity } from '@/comment/comment.entity';
import { UserEntity } from '@/user/user.entity';

@Entity('article')
export class ArticleEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  authorUsername: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  body: string;

  @Column('simple-array')
  tagList: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: 0 })
  @Check(`"favoritesCount" >= 0`)
  favoritesCount: number;

  @OneToMany(
    type => CommentEntity,
    comment => comment.article,
  )
  comments: CommentEntity[];

  @ManyToOne(
    type => UserEntity,
    user => user.articles,
  )
  @JoinColumn({ name: 'authorUsername', referencedColumnName: 'username' })
  author: UserEntity;
}
