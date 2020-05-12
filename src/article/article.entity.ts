import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CommentEntity } from '@/comment/comment.entity';

@Entity('article')
export class ArticleEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

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

  // TODO: Add ManyToOne relationship with UserEntity with authorId as FK referencing id from UserEntity
}
