import { Resolver, Query } from '@nestjs/graphql';
import { Comment } from '@/comment/comment.model';

@Resolver(of => Comment)
export class CommentResolver {}
