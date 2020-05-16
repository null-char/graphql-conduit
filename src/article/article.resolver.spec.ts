import { Test, TestingModule } from '@nestjs/testing';
import { ArticleResolver } from '@/article/article.resolver';
import { ArticleService } from '@/article/article.service';
import { UserEntity } from '@/user/user.entity';
import { Article } from '@/article/article.model';
import { ArticleRepository } from '@/article/article.repository';
import { UserRepository } from '@/user/user.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FavoritesEntity } from '@/article/favorites.entity';
import { Repository } from 'typeorm';
import { CreateArticleInput } from '@/article/input/create-article.input';
import { EditArticleInput } from '@/article/input/edit-article.input';
import { Favorite } from '@/article/favorite.model';

class MockFavoritesRepository extends Repository<FavoritesEntity> {}

describe('ArticleResolver', () => {
  let articleResolver: ArticleResolver;
  let articleService: ArticleService;
  const mockUser = new UserEntity();
  mockUser.id = 666;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleResolver,
        ArticleService,
        ArticleRepository,
        UserRepository,
        {
          provide: getRepositoryToken(FavoritesEntity),
          useClass: MockFavoritesRepository,
        },
      ],
    }).compile();

    articleResolver = module.get<ArticleResolver>(ArticleResolver);
    articleService = module.get<ArticleService>(ArticleService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('resolves "article" query', async () => {
    const mockId = 1;
    const mockResult = new Article();
    const serviceGetArticle = jest
      .spyOn(articleService, 'getArticle')
      .mockResolvedValue(mockResult);

    expect(await articleResolver.getArticle(mockId, mockUser)).toBe<Article>(
      mockResult,
    );
    expect(serviceGetArticle).toHaveBeenCalled();
    expect(serviceGetArticle).toHaveBeenCalledWith<[number, UserEntity]>(
      mockId,
      mockUser,
    );
  });

  it('resolves "articles" query', async () => {
    const mockResult = [new Article(), new Article()];
    const serviceGetArticles = jest
      .spyOn(articleService, 'getArticles')
      .mockResolvedValue(mockResult);

    expect(await articleResolver.getArticles(undefined, mockUser)).toBe<
      Article[]
    >(mockResult);
    expect(serviceGetArticles).toHaveBeenCalled();
    expect(serviceGetArticles).toHaveBeenCalledWith<[undefined, UserEntity]>(
      undefined,
      mockUser,
    );
  });

  it('resolves "createArticle" mutation', async () => {
    const mockInput: CreateArticleInput = {
      title: 'title',
      description: 'description',
      body: 'body',
      tagList: ['tag1', 'tag2'],
    };
    const mockResult: Article = {
      ...mockInput,
      id: 1,
      favoritesCount: 0,
      favorited: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const serviceCreateArticle = jest
      .spyOn(articleService, 'createArticle')
      .mockResolvedValue(mockResult);
    const result = await articleResolver.createArticle(mockInput, mockUser);

    expect(result).toBe<Article>(mockResult);
    expect(serviceCreateArticle).toHaveBeenCalled();
    expect(serviceCreateArticle).toHaveBeenCalledWith<
      [CreateArticleInput, UserEntity]
    >(mockInput, mockUser);
  });

  it('resolves "editArticle" mutation', async () => {
    const mockInput: EditArticleInput = {
      id: 1,
      body: 'new body',
      description: 'new description',
      title: 'new title',
      tagList: ['new', 'tags'],
    };
    const mockResult: Article = new Article();

    const serviceEditArticle = jest
      .spyOn(articleService, 'editArticle')
      .mockResolvedValue(mockResult);
    const result = await articleResolver.editArticle(mockInput, mockUser);

    expect(result).toBe(mockResult);
    expect(serviceEditArticle).toHaveBeenCalled();
    expect(serviceEditArticle).toHaveBeenCalledWith<
      [EditArticleInput, UserEntity]
    >(mockInput, mockUser);
  });

  it('resolves "favoriteArticle" mutation', async () => {
    const mockId = 69;
    const mockResult: Favorite = {
      articleId: mockId,
      userId: mockUser.id,
    };

    const serviceFavoriteArticle = jest
      .spyOn(articleService, 'favoriteArticle')
      .mockResolvedValue(mockResult);
    const result = await articleResolver.favoriteArticle(mockId, mockUser);

    expect(result).toBe<Favorite>(mockResult);
    expect(serviceFavoriteArticle).toHaveBeenCalled();
    expect(serviceFavoriteArticle).toHaveBeenCalledWith<[number, UserEntity]>(
      mockId,
      mockUser,
    );
  });
});
