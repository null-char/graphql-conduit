import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '@/comment/comment.model';
import { CommentEntity } from '@/comment/comment.entity';
import { CommentService } from '@/comment/comment.service';
import { CommentResolver } from '@/comment/comment.resolver';
import { CreateCommentInput } from '@/comment/input/create-comment.input';
import { UserEntity } from '@/user/user.entity';

describe('CommentResolver', () => {
  let commentResolver: CommentResolver;
  let commentService: CommentService;
  const mockUser = new UserEntity();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentResolver,
        CommentService,
        {
          provide: getRepositoryToken(CommentEntity),
          useClass: class MockRepository extends Repository<CommentEntity> {},
        },
      ],
    }).compile();

    commentResolver = module.get<CommentResolver>(CommentResolver);
    commentService = module.get<CommentService>(CommentService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('resolves "comments" query', async () => {
    const mockArticleId = 7345897;
    const mockResult: Comment[] = [new Comment(), new Comment()];
    const serviceGetComments = jest
      .spyOn(commentService, 'getComments')
      .mockResolvedValue(mockResult);

    expect(await commentResolver.getComments(mockArticleId)).toBe<Comment[]>(
      mockResult,
    );
    expect(serviceGetComments).toHaveBeenCalled();
  });

  it('resolves "comment" query', async () => {
    const mockCommentId = 4682;
    const mockResult: Comment = new Comment();
    const serviceGetComment = jest
      .spyOn(commentService, 'getComment')
      .mockResolvedValue(mockResult);

    expect(await commentResolver.getComment(mockCommentId)).toBe<Comment>(
      mockResult,
    );
    expect(serviceGetComment).toHaveBeenCalled();
  });

  it('resolves "createComment" mutation', async () => {
    const mockInput: CreateCommentInput = {
      articleId: 34536,
      body: 'I hate quarantine',
    };
    const mockResult: Comment = new Comment();
    const serviceCreateComment = jest
      .spyOn(commentService, 'createComment')
      .mockResolvedValue(mockResult);

    expect(await commentResolver.createComment(mockInput, mockUser)).toBe<
      Comment
    >(mockResult);
    expect(serviceCreateComment).toHaveBeenCalled();
  });
});
