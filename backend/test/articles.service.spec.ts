import axios from 'axios';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('axios');
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ArticlesService } from '../src/modules/articles/articles.service';
import { ArticlesController } from '../src/modules/articles/articles.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from '../src/modules/articles/article.entity';
import { PriceHistory } from '../src/modules/articles/price-history.entity';
import { UserInterest } from '../src/modules/users/user-interest.entity';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../src/modules/users/users.service';

const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((dto: any) => ({ id: 'new-id', ...dto })),
    save: jest.fn((entity: any) => Promise.resolve(entity)),
    remove: jest.fn(),
};

const mockPriceHistoryRepository = {
    find: jest.fn(),
    create: jest.fn((dto: any) => dto),
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
                    useValue: { get: jest.fn((key: string, def: string) => def) },
                },
            ],
        }).compile();

        service = module.get<ArticlesService>(ArticlesService);

        (axios.post as jest.Mock).mockResolvedValue({
            data: { score: 0, valid: true },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of articles', async () => {
            const articles = [{ id: '1', title: 'Test Article', price: 10 }];
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
            await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findBySeller', () => {
        it('should return articles by seller', async () => {
            const articles = [{ id: '1', sellerId: 'seller-1' }];
            mockRepository.find.mockResolvedValue(articles);

            const result = await service.findBySeller('seller-1');
            expect(result).toEqual(articles);
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { sellerId: 'seller-1' },
                order: { createdAt: 'DESC' },
            });
        });
    });

    describe('findRecommended', () => {
        it('should return latest validated articles when user has no interests', async () => {
            mockUserInterestRepository.find.mockResolvedValue([]);
            const articles = [{ id: '1', status: 'validated' }];
            mockRepository.find.mockResolvedValue(articles);

            const result = await service.findRecommended('user-1');
            expect(result).toEqual(articles);
            expect(mockRepository.find).toHaveBeenCalledWith(
                expect.objectContaining({ where: { status: 'validated' }, take: 20 }),
            );
        });

        it('should return articles matching user interests', async () => {
            mockUserInterestRepository.find.mockResolvedValue([
                { categoryId: 'cat-1' },
                { categoryId: 'cat-2' },
            ]);
            const articles = [{ id: '1', categoryId: 'cat-1' }];
            mockRepository.find.mockResolvedValue(articles);

            const result = await service.findRecommended('user-1');
            expect(result).toEqual(articles);
        });
    });

    describe('getPriceHistory', () => {
        it('should return price history for an article', async () => {
            const history = [{ articleId: '1', oldPrice: 10, newPrice: 15 }];
            mockPriceHistoryRepository.find.mockResolvedValue(history);

            const result = await service.getPriceHistory('1');
            expect(result).toEqual(history);
            expect(mockPriceHistoryRepository.find).toHaveBeenCalledWith({
                where: { articleId: '1' },
                order: { changedAt: 'DESC' },
            });
        });
    });

    describe('create', () => {
        it('should create an article and validate via fraud service', async () => {
            const dto = { title: 'New Article', description: 'Desc', price: 50 };

            const result = await service.create(dto as any, 'seller-1');
            expect(mockRepository.create).toHaveBeenCalled();
            expect(mockRepository.save).toHaveBeenCalled();
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:3002/validate',
                expect.objectContaining({ title: 'New Article' }),
            );
        });

        it('should handle fraud service failure gracefully', async () => {
            (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Service down'));
            const dto = { title: 'Test', description: 'Desc', price: 50 };

            const result = await service.create(dto as any, 'seller-1');
            expect(result).toBeDefined();
        });
    });

    describe('update', () => {
        it('should update an article', async () => {
            const article = { id: '1', sellerId: 'seller-1', price: 50, title: 'Old' };
            mockRepository.findOne.mockResolvedValue(article);

            const result = await service.update('1', { title: 'Updated' } as any, 'seller-1');
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('should throw ForbiddenException if not the seller', async () => {
            const article = { id: '1', sellerId: 'seller-1', price: 50 };
            mockRepository.findOne.mockResolvedValue(article);

            await expect(service.update('1', {} as any, 'other-user')).rejects.toThrow(ForbiddenException);
        });

        it('should track price history on price change', async () => {
            const article = { id: '1', sellerId: 'seller-1', price: 50, title: 'Art', description: 'Desc' };
            mockRepository.findOne.mockResolvedValue(article);

            await service.update('1', { price: 75 } as any, 'seller-1');
            expect(mockPriceHistoryRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ articleId: '1', oldPrice: 50, newPrice: 75 }),
            );
            expect(mockPriceHistoryRepository.save).toHaveBeenCalled();
        });

        it('should handle fraud service failure on price change gracefully', async () => {
            const article = { id: '1', sellerId: 'seller-1', price: 50, title: 'Art', description: 'Desc' };
            mockRepository.findOne.mockResolvedValue(article);
            (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Service down'));

            const result = await service.update('1', { price: 75 } as any, 'seller-1');
            expect(result).toBeDefined();
        });
    });

    describe('remove', () => {
        it('should remove an article', async () => {
            const article = { id: '1', sellerId: 'seller-1' };
            mockRepository.findOne.mockResolvedValue(article);

            await service.remove('1', 'seller-1');
            expect(mockRepository.remove).toHaveBeenCalledWith(article);
        });

        it('should throw ForbiddenException if not the seller', async () => {
            const article = { id: '1', sellerId: 'seller-1' };
            mockRepository.findOne.mockResolvedValue(article);

            await expect(service.remove('1', 'other-user')).rejects.toThrow(ForbiddenException);
        });
    });
});

describe('ArticlesController', () => {
    let controller: ArticlesController;
    const mockUsersService = {
        findOrCreate: jest.fn().mockResolvedValue({ id: 'u1' }),
    };
    const mockService = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        findBySeller: jest.fn(),
        findPending: jest.fn(),
        moderateStatus: jest.fn(),
        findRecommended: jest.fn(),
        getPriceHistory: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ArticlesController],
            providers: [
                { provide: ArticlesService, useValue: mockService },
                { provide: UsersService, useValue: mockUsersService },
            ],
        }).compile();

        controller = module.get<ArticlesController>(ArticlesController);
    });

    afterEach(() => jest.clearAllMocks());

    it('should call findAll', () => {
        controller.findAll();
        expect(mockService.findAll).toHaveBeenCalled();
    });

    it('should call findOne', () => {
        controller.findOne('1');
        expect(mockService.findOne).toHaveBeenCalledWith('1');
    });

    it('should call findRecommended', async () => {
        await controller.findRecommended({
            user: {
                sub: 'u1',
                email: 'u1@test.com',
                preferred_username: 'u1',
            },
        });
        expect(mockService.findRecommended).toHaveBeenCalledWith('u1');
    });

    it('should call findMine', async () => {
        mockService.findBySeller.mockResolvedValue([]);
        await controller.findMine({
            user: {
                sub: 'u1',
                email: 'u1@test.com',
                preferred_username: 'u1',
            },
        });
        expect(mockService.findBySeller).toHaveBeenCalledWith('u1');
    });

    it('should call findAdminPending when admin', async () => {
        mockService.findPending.mockResolvedValue([]);
        await controller.findAdminPending({
            user: { appRoles: ['admin'] },
        });
        expect(mockService.findPending).toHaveBeenCalled();
    });

    it('should forbid findAdminPending when appRoles is not an array', async () => {
        await expect(
            controller.findAdminPending({
                user: { appRoles: 'admin' as any },
            }),
        ).rejects.toThrow(ForbiddenException);
    });

    it('should forbid findAdminPending when admin role is missing', async () => {
        await expect(
            controller.findAdminPending({
                user: { appRoles: ['buyer'] },
            }),
        ).rejects.toThrow(ForbiddenException);
    });

    it('should call moderateAdmin when admin', async () => {
        mockService.moderateStatus.mockResolvedValue({ ok: true });
        await controller.moderateAdmin(
            'article-1',
            { status: 'validated' },
            {
                user: { appRoles: ['admin'] },
            },
        );
        expect(mockService.moderateStatus).toHaveBeenCalledWith(
            'article-1',
            'validated',
        );
    });

    it('should call getPriceHistory', () => {
        controller.getPriceHistory('1');
        expect(mockService.getPriceHistory).toHaveBeenCalledWith('1');
    });

    it('should call create', async () => {
        const dto = { title: 'T', description: 'D', price: 10 } as any;
        await controller.create(dto, {
            user: {
                sub: 'u1',
                email: 'u1@test.com',
                preferred_username: 'u1',
            },
        });
        expect(mockService.create).toHaveBeenCalledWith(dto, 'u1');
    });

    it('should call update', async () => {
        const dto = { title: 'Updated' } as any;
        await controller.update('1', dto, {
            user: {
                sub: 'u1',
                email: 'u1@test.com',
                preferred_username: 'u1',
            },
        });
        expect(mockService.update).toHaveBeenCalledWith('1', dto, 'u1');
    });

    it('should call remove', async () => {
        await controller.remove('1', {
            user: {
                sub: 'u1',
                email: 'u1@test.com',
                preferred_username: 'u1',
            },
        });
        expect(mockService.remove).toHaveBeenCalledWith('1', 'u1');
    });
});
