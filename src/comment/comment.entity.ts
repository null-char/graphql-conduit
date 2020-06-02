import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ArticleEntity } from '@/article/article.entity';
import { UserEntity } from '@/user/user.entity';

@Entity('comment')
export class CommentEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  articleId: number;

  @Column()
  authorUsername: string;

  @Column()
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    /* istanbul ignore next */
    type => ArticleEntity,
    /* istanbul ignore next */
    article => article.comments,
  )
  @JoinColumn({ name: 'articleId', referencedColumnName: 'id' })
  article: ArticleEntity;

  @ManyToOne(
    /* istanbul ignore next */
    type => UserEntity,
    /* istanbul ignore next */
    user => user.comments,
    { eager: true },
  )
  @JoinColumn({ name: 'authorUsername', referencedColumnName: 'username' })
  author: UserEntity;
}
