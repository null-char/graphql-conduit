import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from '@/comment/comment.entity';
import { CommentService } from '@/comment/comment.service';
import { CommentResolver } from '@/comment/comment.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity])],
  providers: [CommentResolver, CommentService],
})
export class CommentModule {}
