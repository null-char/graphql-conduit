import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Comment } from '@/comment/comment.model';
import { CommentService } from '@/comment/comment.service';
import { CreateCommentInput } from '@/comment/input/create-comment.input';
import { UserEntity } from '@/user/user.entity';
import { GetUser } from '@/shared/get-user.decorator';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/auth/guard/gql-auth.guard';

@Resolver(of => Comment)
export class CommentResolver {
  constructor(private commentService: CommentService) {}

  @Query(returns => [Comment], { name: 'comments' })
  public async getComments(
    @Args('articleId', { type: () => Int }) articleId: number,
  ): Promise<Comment[]> {
    return this.commentService.getComments(articleId);
  }

  @Query(returns => Comment, { name: 'comment' })
  public async getComment(
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<Comment> {
    return this.commentService.getComment(commentId);
  }

  @Mutation(returns => Comment)
  @UseGuards(GqlAuthGuard)
  public async createComment(
    @Args('createCommentInput', { type: () => CreateCommentInput })
    createCommentInput: CreateCommentInput,
    @GetUser() user: UserEntity,
  ): Promise<Comment> {
    return this.commentService.createComment(createCommentInput, user);
  }
}
