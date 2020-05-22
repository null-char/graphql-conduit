import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from '@/comment/comment.entity';
import { Comment } from '@/comment/comment.model';
import { CreateCommentInput } from '@/comment/input/create-comment.input';
import { UserEntity } from '@/user/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentsRepository: Repository<CommentEntity>,
  ) {}

  public async getComments(articleId: number): Promise<Comment[]> {
    return this.commentsRepository.find({ where: { articleId } });
  }

  public async createComment(
    createCommentInput: CreateCommentInput,
    user: UserEntity,
  ): Promise<Comment> {
    const { articleId, body } = createCommentInput;

    const newComment = {
      articleId,
      body,
      authorUsername: user.username,
    };

    return this.commentsRepository.save(newComment);
  }

  // possibly move this function to a custom repository
  public async getComment(commentId: number): Promise<Comment> {
    return this.commentsRepository.findOne(commentId);
  }
}
