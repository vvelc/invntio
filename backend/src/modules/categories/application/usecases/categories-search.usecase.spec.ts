import { Test, TestingModule } from '@nestjs/testing';
import { CategorySearchUseCase } from './categories-search.usecase';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Category } from '../../domain/entity/category.entity';
import { v4 as uuidV4 } from 'uuid';

describe('CategorySearchUseCase', () => {
  let categorySearchUseCase: CategorySearchUseCase;
  let categoryRepository: Repository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategorySearchUseCase,
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
      ],
    }).compile();

    categorySearchUseCase = module.get<CategorySearchUseCase>(
      CategorySearchUseCase,
    );
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
  });

  describe('searchCategoriesByKeyword', () => {
    it('should return categories that match the keyword', async () => {
      // Arrange
      const keyword = 'example';
      const expectedCategories: Category[] = [
        {
          id: uuidV4(),
          name: 'Category 1',
          isActive: true,
          createdAt: new Date(),
        },
        {
          id: uuidV4(),
          name: 'Category 2',
          isActive: true,
          createdAt: new Date(),
        },
      ];
      jest
        .spyOn(categoryRepository, 'find')
        .mockResolvedValue(expectedCategories);

      // Act
      const result = await categorySearchUseCase.searchCategoriesByKeyword(
        keyword,
      );

      // Assert
      expect(categoryRepository.find).toHaveBeenCalledWith({
        where: {
          name: keyword && Like(`%${keyword}%`),
        },
      });
      expect(result).toEqual(expectedCategories);
    });

    it('should return an empty array if no categories match the keyword', async () => {
      // Arrange
      const keyword = 'example';
      const expectedCategories: Category[] = [];
      jest.spyOn(categoryRepository, 'find').mockResolvedValue([]);

      // Act
      const result = await categorySearchUseCase.searchCategoriesByKeyword(
        keyword,
      );

      // Assert
      expect(categoryRepository.find).toHaveBeenCalledWith({
        where: {
          name: keyword && Like(`%${keyword}%`),
        },
      });
      expect(result).toEqual(expectedCategories);
    });
  });

  describe('filterCategoriesByCriteria', () => {
    it('should return categories based on the provided criteria', async () => {
      // Arrange
      const criteria: Partial<Category> = {
        name: 'Category',
        isActive: true,
      };
      const filterOptions: FindOptionsWhere<Category> = {
        name: criteria.name && Like(`%${criteria.name}%`),
        isActive: criteria.isActive,
      };
      const expectedCategories: Category[] = [
        {
          id: uuidV4(),
          name: 'Category 1',
          isActive: true,
          createdAt: new Date(),
        },
        {
          id: uuidV4(),
          name: 'Category 2',
          isActive: true,
          createdAt: new Date(),
        },
      ];
      jest
        .spyOn(categoryRepository, 'findBy')
        .mockResolvedValue(expectedCategories);

      // Act
      const result = await categorySearchUseCase.filterCategoriesByCriteria(
        criteria,
      );

      // Assert
      expect(categoryRepository.findBy).toHaveBeenCalledWith(filterOptions);
      expect(result).toEqual(expectedCategories);
    });

    it('should return an empty array if no categories meet the criteria', async () => {
      // Arrange
      const criteria: Partial<Category> = {
        name: 'Category ABC',
        isActive: true,
      };

      const filterOptions: FindOptionsWhere<Category> = {
        name: criteria.name && Like(`%${criteria.name}%`),
        isActive: criteria.isActive,
      };

      const expectedCategories: Category[] = [];
      jest.spyOn(categoryRepository, 'findBy').mockResolvedValue([]);

      // Act
      const result = await categorySearchUseCase.filterCategoriesByCriteria(
        criteria,
      );

      // Assert
      expect(categoryRepository.findBy).toHaveBeenCalledWith(filterOptions);
      expect(result).toEqual(expectedCategories);
    });
  });
});
