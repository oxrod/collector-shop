import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from '../src/modules/articles/articles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from '../src/modules/articles/article.entity';
import { PriceHistory } from '../src/modules/articles/price-history.entity';
import { UserInterest } from '../src/modules/users/user-interest.entity';
import { ConfigService } from '@nestjs/config';

const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
};

const mockPriceHistoryRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
};

const mockUserInterestRepository = {
    find: jest.fn(),
};

describe('ArticlesService', () => {
    let service: ArticlesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArticlesService,
                {
                    provide: getRepositoryToken(Article),
                    useValue: mockRepository,
                },
                {
                    provide: getRepositoryToken(PriceHistory),
                    useValue: mockPriceHistoryRepository,
                },
                {
                    provide: getRepositoryToken(UserInterest),
                    useValue: mockUserInterestRepository,
                },
                {
                    provide: ConfigService,
                    useValue: { get: jest.fn().mockReturnValue('http://localhost:3002') },
                },
            ],
        }).compile();

        service = module.get<ArticlesService>(ArticlesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of articles', async () => {
            const articles = [
                { id: '1', title: 'Test Article', price: 10 },
            ];
            mockRepository.find.mockResolvedValue(articles);

            const result = await service.findAll();
            expect(result).toEqual(articles);
            expect(mockRepository.find).toHaveBeenCalledWith({
                relations: ['seller'],
                order: { createdAt: 'DESC' },
            });
        });
    });

    describe('findOne', () => {
        it('should return a single article', async () => {
            const article = { id: '1', title: 'Test Article', price: 10 };
            mockRepository.findOne.mockResolvedValue(article);

            const result = await service.findOne('1');
            expect(result).toEqual(article);
        });

        it('should throw NotFoundException if article not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            await expect(service.findOne('non-existent')).rejects.toThrow();
        });
    });
});
