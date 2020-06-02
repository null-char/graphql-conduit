import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from '@/comment/comment.entity';
import { CommentService } from '@/comment/comment.service';
import { Comment } from '@/comment/comment.model';
import { CreateCommentInput } from '@/comment/input/create-comment.input';
import { UserEntity } from '@/user/user.entity';

class MockCommentsRepository extends Repository<CommentEntity> {}

describe('CommentService', () => {
  let commentService: CommentService;
  let commentsRepository: Repository<CommentEntity>;
  const mockUser = new UserEntity();
  mockUser.id = 1;
  mockUser.username = 'test';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(CommentEntity),
          useClass: MockCommentsRepository,
        },
      ],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
    commentsRepository = module.get<MockCommentsRepository>(
      getRepositoryToken(CommentEntity),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('gets comments', async () => {
    const mockArticleId = 31;
    const mockResult: CommentEntity[] = [
      new CommentEntity(),
      new CommentEntity(),
    ];
    const repositoryFind = jest
      .spyOn(commentsRepository, 'find')
      .mockResolvedValue(mockResult);

    expect(await commentService.getComments(mockArticleId)).toBe<Comment[]>(
      mockResult,
    );
    expect(repositoryFind).toHaveBeenCalled();
  });

  it('gets a comment with given id', async () => {
    const mockId = 1337;
    const mockResult: CommentEntity = new CommentEntity();
    const repositoryFindOne = jest
      .spyOn(commentsRepository, 'findOne')
      .mockResolvedValue(mockResult);

    expect(await commentService.getComment(mockId)).toBe<Comment>(mockResult);
    expect(repositoryFindOne).toHaveBeenCalled();
  });

  it('creates a new comment', async () => {
    const mockInput: CreateCommentInput = {
      articleId: 62,
      body: 'test comment',
    };
    const mockResult: CommentEntity = new CommentEntity();
    mockResult.articleId = mockInput.articleId;
    mockResult.body = mockInput.body;

    const repositorySave = jest
      .spyOn(commentsRepository, 'save')
      .mockResolvedValue(mockResult);

    expect(
      await commentService.createComment(mockInput, mockUser),
    ).toMatchObject<Comment>(mockResult);
    expect(repositorySave).toHaveBeenCalled();
    expect(repositorySave).toHaveBeenCalledWith({
      ...mockInput,
      authorUsername: mockUser.username,
    });
  });
});
