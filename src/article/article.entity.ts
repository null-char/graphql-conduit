import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CommentEntity } from '@/comment/comment.entity';
import { UserEntity } from '@/user/user.entity';

@Entity('article')
export class ArticleEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  authorId: number;

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
  favoritesCount: number;

  @OneToMany(
    type => CommentEntity,
    comment => comment.article,
    { eager: true },
  )
  comments: CommentEntity[];

  @ManyToOne(
    type => UserEntity,
    user => user.articles,
    { eager: true },
  )
  @JoinColumn({ name: 'authorId', referencedColumnName: 'id' })
  author: UserEntity;
}
