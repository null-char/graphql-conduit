import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from '@/article/article.service';
import { ArticleRepository } from '@/article/article.repository';
import { UserService } from '@/user/user.service';
import { UserRepository } from '@/user/user.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FavoritesEntity } from '@/article/favorites.entity';
import {
  Repository,
  SelectQueryBuilder,
  QueryRunner,
  InsertResult,
  DeepPartial,
  SaveOptions,
  DeleteResult,
} from 'typeorm';
import { FollowsEntity } from '@/user/follows.entity';
import { ArticleEntity } from '@/article/article.entity';
import { Article } from '@/article/article.model';
import { UserEntity } from '@/user/user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { FilterArticlesInput } from '@/article/input/filter-articles.input';
import { QueryOptionsInput } from '@/article/input/query-options.input';
import { Profile } from '@/user/profile.model';
import { CreateArticleInput } from '@/article/input/create-article.input';
import { EditArticleInput } from '@/article/input/edit-article.input';

describe('ArticleService', () => {
  let articleService: ArticleService;
  let articleRepository: ArticleRepository;
  let favoritesRepository: Repository<FavoritesEntity>;
  let userService: UserService;
  let userRepository: UserRepository;
  let mockQueryBuilder: Partial<SelectQueryBuilder<ArticleEntity>>;
  let mockCreateQueryBuilder: jest.Mock<SelectQueryBuilder<ArticleEntity>, []>;
  let createQBSpy: jest.SpyInstance<
    SelectQueryBuilder<ArticleEntity>,
    [string?, QueryRunner?]
  >;
  let mockUser: UserEntity | undefined;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        ArticleRepository,
        UserService,
        {
          provide: getRepositoryToken(FollowsEntity),
          useClass: class MockRepository extends Repository<FollowsEntity> {},
        },
        UserRepository,
        {
          provide: getRepositoryToken(FavoritesEntity),
          useClass: class MockRepository extends Repository<FavoritesEntity> {},
        },
      ],
    }).compile();

    articleService = moduleFixture.get<ArticleService>(ArticleService);
    articleRepository = moduleFixture.get<ArticleRepository>(ArticleRepository);
    favoritesRepository = moduleFixture.get<Repository<FavoritesEntity>>(
      getRepositoryToken(FavoritesEntity),
    );
    userService = moduleFixture.get<UserService>(UserService);
    userRepository = moduleFixture.get<UserRepository>(UserRepository);
    mockUser = new UserEntity();
    mockUser.username = 'test';
    mockUser.id = 1;

    // query builder stuff
    mockQueryBuilder = {
      // returns a query builder of 'any'
      subQuery: jest.fn().mockReturnThis() as jest.Mock<
        SelectQueryBuilder<any>,
        []
      >,
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      andWhereInIds: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getQuery: jest.fn().mockReturnValue('query string'),
      getOne: jest.fn().mockResolvedValue(new ArticleEntity()),
      getMany: jest
        .fn()
        .mockResolvedValue([new ArticleEntity(), new ArticleEntity()]),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
    };

    mockCreateQueryBuilder = jest.fn(
      () => (mockQueryBuilder as unknown) as SelectQueryBuilder<ArticleEntity>,
    );

    createQBSpy = jest
      .spyOn(articleRepository, 'createQueryBuilder')
      .mockImplementation(mockCreateQueryBuilder);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getArticle', () => {
    let mockArticleEntity: ArticleEntity;
    let findArticleById: jest.SpyInstance<Promise<ArticleEntity>, [number]>;

    beforeEach(() => {
      mockArticleEntity = new ArticleEntity();
      mockArticleEntity.id = 1;
      findArticleById = jest
        .spyOn(articleRepository, 'findArticleById')
        .mockResolvedValue(mockArticleEntity);
    });

    it('gets an article for an unauthenticated user', async () => {
      const mockUser = undefined; // unauthenticated

      expect(
        await articleService.getArticle(mockArticleEntity.id, mockUser),
      ).toBe<Article>(mockArticleEntity);
      expect(findArticleById).toHaveBeenCalled();
    });

    it('gets an article for an authenticated user', async () => {
      const createQB = jest
        .spyOn(articleRepository, 'createQueryBuilder')
        .mockImplementation(mockCreateQueryBuilder);

      // mockUser is defined by default
      expect(
        await articleService.getArticle(mockArticleEntity.id, mockUser),
      ).toBeInstanceOf(ArticleEntity);
      expect(createQB).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      // make sure we map the "favorited" column for authenticated users
      expect(mockQueryBuilder.addSelect).toHaveBeenCalled();
    });

    it('throws an error if article is not found for an authenticated user', async () => {
      const mockResult = undefined;
      const getOne = jest
        .spyOn(mockQueryBuilder, 'getOne')
        .mockImplementation(mockResult);

      await expect(
        articleService.getArticle(69, mockUser),
      ).rejects.toThrowError(NotFoundException);
      expect(createQBSpy).toHaveBeenCalled();
      expect(getOne).toHaveBeenCalled();
    });
  });

  describe('getArticles', () => {
    let queryOptionsInput: QueryOptionsInput;
    let mockResult: ArticleEntity[];
    let getManySpy: jest.SpyInstance<Promise<ArticleEntity[]>, []>;

    beforeEach(() => {
      queryOptionsInput = {
        limit: 10,
        offset: 10,
      };
      mockResult = [new ArticleEntity(), new ArticleEntity()];
      getManySpy = jest
        .spyOn(mockQueryBuilder, 'getMany')
        .mockResolvedValue(mockResult);
    });

    it('gets all articles for an unauthenticated user', async () => {
      // no specific query args
      const mockFilterInput = null;
      // unauthenticated
      mockUser = undefined;

      expect(
        await articleService.getArticles(
          mockFilterInput,
          queryOptionsInput,
          mockUser,
        ),
      ).toBe<ArticleEntity[]>(mockResult);
      expect(createQBSpy).toHaveBeenCalledTimes(1);
      // make sure we don't attach any where clauses
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      // make sure we don't map the "favorited" column for unauthenticated users
      expect(mockQueryBuilder.addSelect).not.toHaveBeenCalled();
      expect(mockQueryBuilder.limit).toHaveBeenCalled();
      expect(mockQueryBuilder.offset).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
      expect(getManySpy).toHaveBeenCalled();
    });

    it('gets all articles for an authenticated user', async () => {
      // no specific query args
      const mockFilterInput = null;

      expect(
        await articleService.getArticles(
          mockFilterInput,
          queryOptionsInput,
          mockUser,
        ),
      ).toBe<ArticleEntity[]>(mockResult);
      // make sure the "favorited" column is mapped
      expect(mockQueryBuilder.addSelect).toHaveBeenCalled();
      expect(getManySpy).toHaveBeenCalled();
    });

    it('gets all articles filtered by author', async () => {
      const mockFilterInput = {
        author: 'test',
      };

      expect(
        await articleService.getArticles(
          mockFilterInput,
          queryOptionsInput,
          mockUser,
        ),
      ).toBe<ArticleEntity[]>(mockResult);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(1);
      expect(getManySpy).toHaveBeenCalled();
    });

    it('gets all articles filtered by author and tags', async () => {
      const mockFilterInput = {
        author: 'test',
        tags: ['blm', 'policebrutality'],
      };

      expect(
        await articleService.getArticles(
          mockFilterInput,
          queryOptionsInput,
          mockUser,
        ),
      ).toBe<ArticleEntity[]>(mockResult);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
      expect(getManySpy).toHaveBeenCalled();
    });

    it('gets all articles filtered by author, tags and favorited', async () => {
      const mockFilterInput = {
        author: 'test',
        tags: ['blm', 'policebrutality'],
        // name of user to get the favorites of
        favorited: 'joe',
      };
      const mockRequiredUser = new UserEntity();
      mockRequiredUser.username = mockFilterInput.favorited;
      const mockFavoritesEntities: FavoritesEntity[] = [
        new FavoritesEntity(),
        new FavoritesEntity(),
      ];

      const findUserByUsername = jest
        .spyOn(userRepository, 'findUserByUsername')
        .mockResolvedValue(mockRequiredUser);
      const favoritesRepositoryFind = jest
        .spyOn(favoritesRepository, 'find')
        .mockResolvedValue(mockFavoritesEntities);

      expect(
        await articleService.getArticles(
          mockFilterInput,
          queryOptionsInput,
          mockUser,
        ),
      ).toBe<ArticleEntity[]>(mockResult);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
      expect(findUserByUsername).toHaveBeenCalled();
      // make sure we look up all the favorites of the requested user
      expect(favoritesRepositoryFind).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhereInIds).toHaveBeenCalled();
      expect(getManySpy).toHaveBeenCalled();
    });
  });

  describe('getAuthor', () => {
    it('gets the author of the provided article', async () => {
      const mockAuthor = new Profile();
      const mockArticle = new Article();
      const userServiceGetProfile = jest
        .spyOn(userService, 'getProfile')
        .mockResolvedValue(mockAuthor);

      expect(await articleService.getAuthor(mockArticle, mockUser)).toBe<
        Profile
      >(mockAuthor);
      expect(userServiceGetProfile).toHaveBeenCalled();
    });
  });

  describe('createArticle', () => {
    it('creates an article successfully', async () => {
      const mockInput: CreateArticleInput = {
        body: 'body of the article',
        description: 'article description',
        tagList: ['jest', 'nest'],
        title: 'article title',
      };
      const mockArticleEntity = new ArticleEntity();
      mockArticleEntity.body = mockInput.body;
      mockArticleEntity.description = mockInput.description;
      mockArticleEntity.tagList = mockInput.tagList;
      mockArticleEntity.title = mockInput.title;
      mockArticleEntity.authorUsername = mockUser.username;

      const articleRepositorySave = jest
        .spyOn(articleRepository, 'save')
        .mockResolvedValue(mockArticleEntity);

      expect(
        await articleService.createArticle(mockInput, mockUser),
      ).toMatchObject({
        ...mockInput,
        favorited: false,
        authorUsername: mockUser.username,
      });
      expect(articleRepositorySave).toHaveBeenCalled();
    });
  });

  describe('editArticle', () => {
    let mockInput: EditArticleInput;

    beforeEach(() => {
      mockInput = {
        id: 1,
        title: 'new title',
        description: 'new description',
      };
    });

    it('updates all columns of a given article with the new details', async () => {
      const mockArticle = new ArticleEntity();
      mockArticle.authorUsername = mockUser.username;
      const findArticleById = jest
        .spyOn(articleRepository, 'findArticleById')
        .mockResolvedValue(mockArticle);
      const updatedArticle: ArticleEntity = {
        ...mockArticle,
        ...mockInput,
      };
      const repositorySave = jest
        .spyOn(articleRepository, 'save')
        .mockResolvedValue(updatedArticle);

      expect(
        await articleService.editArticle(mockInput, mockUser),
      ).toMatchObject(updatedArticle);
      // make sure the provided article had its fields updated
      expect(mockArticle).toMatchObject(updatedArticle);
      expect(findArticleById).toHaveBeenCalled();
      expect(repositorySave).toHaveBeenCalled();
    });

    it('throws a ForbiddenException error if the article to be updated does not belong to the user updating it', async () => {
      const mockArticle = new ArticleEntity();
      mockArticle.authorUsername = 'acreativeusername';
      // a random user who does not own the resource to be updated
      const mockUser = new UserEntity();
      mockUser.username = 'pathological_liar101';
      const findArticleById = jest
        .spyOn(articleRepository, 'findArticleById')
        .mockResolvedValue(mockArticle);
      const updatedArticle: ArticleEntity = {
        ...mockInput,
        ...mockArticle,
      };
      const repositorySave = jest
        .spyOn(articleRepository, 'save')
        .mockResolvedValue(updatedArticle);

      await expect(
        articleService.editArticle(mockInput, mockUser),
      ).rejects.toThrowError(ForbiddenException);
      expect(findArticleById).toHaveBeenCalled();
      // we don't want any of the fields to be updated in this instance
      expect(mockArticle).not.toMatchObject(updatedArticle);
      // definitely make sure we don't save the entity (if updated)
      expect(repositorySave).not.toHaveBeenCalled();
    });
  });

  describe('favoriteArticle & unfavoriteArticle', () => {
    let mockArticle: ArticleEntity;
    let findArticleById: jest.SpyInstance<Promise<ArticleEntity>, [number]>;
    let articleRepositorySave: jest.SpyInstance<
      Promise<DeepPartial<ArticleEntity> & ArticleEntity>,
      [DeepPartial<ArticleEntity>, SaveOptions?]
    >;

    beforeAll(() => {
      mockArticle = new ArticleEntity();
      mockArticle.id = 1;
      // start at 0 favorites
      mockArticle.favoritesCount = 0;
    });

    // beforeEach is executed AFTER beforeAll
    beforeEach(() => {
      findArticleById = jest
        .spyOn(articleRepository, 'findArticleById')
        .mockResolvedValue(mockArticle);
      articleRepositorySave = jest
        .spyOn(articleRepository, 'save')
        .mockResolvedValue(mockArticle);
    });

    it('favorites an article', async () => {
      const favoritesRepoInsert = jest
        .spyOn(favoritesRepository, 'insert')
        .mockResolvedValue(new InsertResult());
      const mockResult: Article = {
        ...mockArticle,
        favoritesCount: mockArticle.favoritesCount + 1,
        favorited: true,
      };

      expect(
        await articleService.favoriteArticle(mockArticle.id, mockUser),
      ).toMatchObject(mockResult);
      expect(favoritesRepoInsert).toHaveBeenCalled();
      expect(findArticleById).toHaveBeenCalled();
      expect(articleRepositorySave).toHaveBeenCalled();
    });

    it('unfavorites an article', async () => {
      const favoritesRepoDelete = jest
        .spyOn(favoritesRepository, 'delete')
        .mockResolvedValue(new DeleteResult());
      const mockResult: Article = {
        ...mockArticle,
        favoritesCount: mockArticle.favoritesCount - 1,
        favorited: false,
      };

      expect(
        await articleService.unfavoriteArticle(mockArticle.id, mockUser),
      ).toMatchObject(mockResult);
      expect(favoritesRepoDelete).toHaveBeenCalled();
      expect(findArticleById).toHaveBeenCalled();
      expect(articleRepositorySave).toHaveBeenCalled();
    });
  });
});
