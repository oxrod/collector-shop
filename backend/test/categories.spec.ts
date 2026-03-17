import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from '../src/modules/categories/categories.service';
import { CategoriesController } from '../src/modules/categories/categories.controller';
import { Category } from '../src/modules/categories/category.entity';

const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
};

describe('CategoriesService', () => {
    let service: CategoriesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategoriesService,
                {
                    provide: getRepositoryToken(Category),
                    useValue: mockCategoryRepository,
                },
            ],
        }).compile();

        service = module.get<CategoriesService>(CategoriesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of categories ordered by name ASC', async () => {
            const categories = [
                { id: '1', name: 'A', description: 'Desc A' },
                { id: '2', name: 'B', description: 'Desc B' },
            ];
            mockCategoryRepository.find.mockResolvedValue(categories);

            const result = await service.findAll();
            expect(result).toEqual(categories);
            expect(mockCategoryRepository.find).toHaveBeenCalledWith({
                order: { name: 'ASC' },
            });
        });
    });

    describe('findOne', () => {
        it('should return a single category', async () => {
            const category = { id: '1', name: 'Test', description: 'Desc' };
            mockCategoryRepository.findOne.mockResolvedValue(category);

            const result = await service.findOne('1');
            expect(result).toEqual(category);
            expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
                where: { id: '1' },
            });
        });

        it('should throw NotFoundException if category not found', async () => {
            mockCategoryRepository.findOne.mockResolvedValue(null);
            await expect(service.findOne('non-existent')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('create', () => {
        it('should create and return a category', async () => {
            const created = { id: '1', name: 'New', description: 'New desc' };
            mockCategoryRepository.create.mockReturnValue({ name: 'New', description: 'New desc' });
            mockCategoryRepository.save.mockResolvedValue(created);

            const result = await service.create('New', 'New desc');
            expect(result).toEqual(created);
            expect(mockCategoryRepository.create).toHaveBeenCalledWith({
                name: 'New',
                description: 'New desc',
            });
            expect(mockCategoryRepository.save).toHaveBeenCalled();
        });

        it('should create a category without description', async () => {
            const created = { id: '1', name: 'New', description: null };
            mockCategoryRepository.create.mockReturnValue({ name: 'New' });
            mockCategoryRepository.save.mockResolvedValue(created);

            const result = await service.create('New');
            expect(result).toEqual(created);
            expect(mockCategoryRepository.create).toHaveBeenCalledWith({
                name: 'New',
                description: undefined,
            });
        });
    });

    describe('remove', () => {
        it('should remove a category', async () => {
            const category = { id: '1', name: 'Test', description: 'Desc' };
            mockCategoryRepository.findOne.mockResolvedValue(category);
            mockCategoryRepository.remove.mockResolvedValue(category);

            await service.remove('1');
            expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
                where: { id: '1' },
            });
            expect(mockCategoryRepository.remove).toHaveBeenCalledWith(category);
        });

        it('should throw NotFoundException if category not found', async () => {
            mockCategoryRepository.findOne.mockResolvedValue(null);
            await expect(service.remove('non-existent')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});

describe('CategoriesController', () => {
    let controller: CategoriesController;
    let categoriesService: {
        findAll: jest.Mock;
        findOne: jest.Mock;
        create: jest.Mock;
        remove: jest.Mock;
    };

    beforeEach(async () => {
        categoriesService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CategoriesController],
            providers: [
                {
                    provide: CategoriesService,
                    useValue: categoriesService,
                },
            ],
        }).compile();

        controller = module.get<CategoriesController>(CategoriesController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should delegate to categoriesService.findAll', async () => {
            const categories = [{ id: '1', name: 'A' }];
            categoriesService.findAll.mockResolvedValue(categories);

            const result = await controller.findAll();
            expect(result).toEqual(categories);
            expect(categoriesService.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should delegate to categoriesService.findOne with id', async () => {
            const category = { id: '1', name: 'Test' };
            categoriesService.findOne.mockResolvedValue(category);

            const result = await controller.findOne('1');
            expect(result).toEqual(category);
            expect(categoriesService.findOne).toHaveBeenCalledWith('1');
        });
    });

    describe('create', () => {
        it('should delegate to categoriesService.create with body', async () => {
            const body = { name: 'New', description: 'Desc' };
            const created = { id: '1', ...body };
            categoriesService.create.mockResolvedValue(created);

            const result = await controller.create(body);
            expect(result).toEqual(created);
            expect(categoriesService.create).toHaveBeenCalledWith(
                body.name,
                body.description,
            );
        });
    });

    describe('remove', () => {
        it('should delegate to categoriesService.remove with id', async () => {
            categoriesService.remove.mockResolvedValue(undefined);

            await controller.remove('1');
            expect(categoriesService.remove).toHaveBeenCalledWith('1');
        });
    });
});
