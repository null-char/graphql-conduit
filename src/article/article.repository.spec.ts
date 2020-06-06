import { Test, TestingModule } from '@nestjs/testing';
import { ArticleRepository } from '@/article/article.repository';
import { ArticleEntity } from '@/article/article.entity';
import { NotFoundException } from '@nestjs/common';

describe('ArticleRepository', () => {
  let articleRepository: ArticleRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [ArticleRepository],
    }).compile();

    articleRepository = moduleFixture.get<ArticleRepository>(ArticleRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findArticleById', () => {
    it('finds an article by id', async () => {
      const mockArticleId = 1;
      const mockArticle = new ArticleEntity();
      mockArticle.id = mockArticleId;
      const findOne = jest
        .spyOn(articleRepository, 'findOne')
        .mockResolvedValue(mockArticle);

      expect(await articleRepository.findArticleById(mockArticleId)).toBe<
        ArticleEntity
      >(mockArticle);
      expect(findOne).toHaveBeenCalled();
    });

    it('throws a NotFoundException if article does not exist', async () => {
      const mockArticleId = 1337;
      // required article does not exist
      const mockArticle = undefined;
      const findOne = jest
        .spyOn(articleRepository, 'findOne')
        .mockResolvedValue(mockArticle);

      await expect(
        articleRepository.findArticleById(mockArticleId),
      ).rejects.toThrowError(NotFoundException);
      expect(findOne).toHaveBeenCalled();
    });
  });
});
