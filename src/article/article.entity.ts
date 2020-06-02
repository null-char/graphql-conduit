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
    /* istanbul ignore next */
    type => CommentEntity,
    /* istanbul ignore next */
    comment => comment.article,
  )
  comments: CommentEntity[];

  @ManyToOne(
    /* istanbul ignore next */
    type => UserEntity,
    /* istanbul ignore next */
    user => user.articles,
  )
  @JoinColumn({ name: 'authorUsername', referencedColumnName: 'username' })
  author: UserEntity;

  /* 
    Not actually for storage in the database.
    This property is mapped to either false / true if user is authenticated.
    Since we still don't have an addSelectAndMap this "hack" is employed.
  */
  @Column('boolean', { select: false, nullable: true })
  favorited: boolean;
}
