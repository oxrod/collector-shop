import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ShopsService } from '../src/modules/shops/shops.service';
import { ShopsController } from '../src/modules/shops/shops.controller';
import { Shop } from '../src/modules/shops/shop.entity';

const mockShopRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
};

describe('ShopsService', () => {
    let service: ShopsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ShopsService,
                {
                    provide: getRepositoryToken(Shop),
                    useValue: mockShopRepository,
                },
            ],
        }).compile();

        service = module.get<ShopsService>(ShopsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of shops with owner relation', async () => {
            const shops = [
                { id: '1', name: 'Shop A', ownerId: 'u1', owner: {} },
                { id: '2', name: 'Shop B', ownerId: 'u2', owner: {} },
            ];
            mockShopRepository.find.mockResolvedValue(shops);

            const result = await service.findAll();
            expect(result).toEqual(shops);
            expect(mockShopRepository.find).toHaveBeenCalledWith({
                relations: ['owner'],
                order: { createdAt: 'DESC' },
            });
        });
    });

    describe('findOne', () => {
        it('should return a single shop with owner relation', async () => {
            const shop = { id: '1', name: 'Test Shop', ownerId: 'u1', owner: {} };
            mockShopRepository.findOne.mockResolvedValue(shop);

            const result = await service.findOne('1');
            expect(result).toEqual(shop);
            expect(mockShopRepository.findOne).toHaveBeenCalledWith({
                where: { id: '1' },
                relations: ['owner'],
            });
        });

        it('should throw NotFoundException if shop not found', async () => {
            mockShopRepository.findOne.mockResolvedValue(null);
            await expect(service.findOne('non-existent')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('findByOwner', () => {
        it('should return shops for the given owner', async () => {
            const shops = [{ id: '1', name: 'My Shop', ownerId: 'u1' }];
            mockShopRepository.find.mockResolvedValue(shops);

            const result = await service.findByOwner('u1');
            expect(result).toEqual(shops);
            expect(mockShopRepository.find).toHaveBeenCalledWith({
                where: { ownerId: 'u1' },
                order: { createdAt: 'DESC' },
            });
        });
    });

    describe('create', () => {
        it('should create and return a shop', async () => {
            const created = {
                id: '1',
                name: 'New Shop',
                description: 'Desc',
                ownerId: 'u1',
            };
            mockShopRepository.create.mockReturnValue({
                name: 'New Shop',
                description: 'Desc',
                ownerId: 'u1',
            });
            mockShopRepository.save.mockResolvedValue(created);

            const result = await service.create('New Shop', 'Desc', 'u1');
            expect(result).toEqual(created);
            expect(mockShopRepository.create).toHaveBeenCalledWith({
                name: 'New Shop',
                description: 'Desc',
                ownerId: 'u1',
            });
            expect(mockShopRepository.save).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update a shop when owner matches', async () => {
            const shop = {
                id: '1',
                name: 'Old',
                description: 'Old desc',
                ownerId: 'u1',
            };
            const updated = { ...shop, name: 'New', description: 'New desc' };
            mockShopRepository.findOne.mockResolvedValue(shop);
            mockShopRepository.save.mockResolvedValue(updated);

            const result = await service.update('1', 'New', 'New desc', 'u1');
            expect(result).toEqual(updated);
            expect(mockShopRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'New', description: 'New desc' }),
            );
        });

        it('should throw ForbiddenException when owner does not match', async () => {
            const shop = { id: '1', name: 'Shop', ownerId: 'u1' };
            mockShopRepository.findOne.mockResolvedValue(shop);

            await expect(
                service.update('1', 'New', 'New desc', 'other-user'),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException if shop not found', async () => {
            mockShopRepository.findOne.mockResolvedValue(null);
            await expect(
                service.update('non-existent', 'New', 'New desc', 'u1'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove a shop when owner matches', async () => {
            const shop = { id: '1', name: 'Shop', ownerId: 'u1' };
            mockShopRepository.findOne.mockResolvedValue(shop);
            mockShopRepository.remove.mockResolvedValue(shop);

            await service.remove('1', 'u1');
            expect(mockShopRepository.findOne).toHaveBeenCalledWith({
                where: { id: '1' },
                relations: ['owner'],
            });
            expect(mockShopRepository.remove).toHaveBeenCalledWith(shop);
        });

        it('should throw ForbiddenException when owner does not match', async () => {
            const shop = { id: '1', name: 'Shop', ownerId: 'u1' };
            mockShopRepository.findOne.mockResolvedValue(shop);

            await expect(service.remove('1', 'other-user')).rejects.toThrow(
                ForbiddenException,
            );
        });

        it('should throw NotFoundException if shop not found', async () => {
            mockShopRepository.findOne.mockResolvedValue(null);
            await expect(service.remove('non-existent', 'u1')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});

describe('ShopsController', () => {
    let controller: ShopsController;
    let shopsService: {
        findAll: jest.Mock;
        findByOwner: jest.Mock;
        findOne: jest.Mock;
        create: jest.Mock;
        update: jest.Mock;
        remove: jest.Mock;
    };

    const mockReq = { user: { sub: 'user-123' } };

    beforeEach(async () => {
        shopsService = {
            findAll: jest.fn(),
            findByOwner: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ShopsController],
            providers: [
                {
                    provide: ShopsService,
                    useValue: shopsService,
                },
            ],
        }).compile();

        controller = module.get<ShopsController>(ShopsController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should delegate to shopsService.findAll', async () => {
            const shops = [{ id: '1', name: 'Shop A' }];
            shopsService.findAll.mockResolvedValue(shops);

            const result = await controller.findAll();
            expect(result).toEqual(shops);
            expect(shopsService.findAll).toHaveBeenCalled();
        });
    });

    describe('findMine', () => {
        it('should delegate to shopsService.findByOwner with req.user.sub', async () => {
            const shops = [{ id: '1', name: 'My Shop', ownerId: 'user-123' }];
            shopsService.findByOwner.mockResolvedValue(shops);

            const result = await controller.findMine(mockReq);
            expect(result).toEqual(shops);
            expect(shopsService.findByOwner).toHaveBeenCalledWith('user-123');
        });
    });

    describe('findOne', () => {
        it('should delegate to shopsService.findOne with id', async () => {
            const shop = { id: '1', name: 'Test Shop' };
            shopsService.findOne.mockResolvedValue(shop);

            const result = await controller.findOne('1');
            expect(result).toEqual(shop);
            expect(shopsService.findOne).toHaveBeenCalledWith('1');
        });
    });

    describe('create', () => {
        it('should delegate to shopsService.create with body and req.user.sub', async () => {
            const body = { name: 'New Shop', description: 'Desc' };
            const created = { id: '1', ...body, ownerId: 'user-123' };
            shopsService.create.mockResolvedValue(created);

            const result = await controller.create(body, mockReq);
            expect(result).toEqual(created);
            expect(shopsService.create).toHaveBeenCalledWith(
                body.name,
                body.description || '',
                'user-123',
            );
        });
    });

    describe('update', () => {
        it('should delegate to shopsService.update with id, body and req.user.sub', async () => {
            const body = { name: 'Updated', description: 'Updated desc' };
            const updated = { id: '1', ...body };
            shopsService.update.mockResolvedValue(updated);

            const result = await controller.update('1', body, mockReq);
            expect(result).toEqual(updated);
            expect(shopsService.update).toHaveBeenCalledWith(
                '1',
                body.name,
                body.description,
                'user-123',
            );
        });
    });

    describe('remove', () => {
        it('should delegate to shopsService.remove with id and req.user.sub', async () => {
            shopsService.remove.mockResolvedValue(undefined);

            await controller.remove('1', mockReq);
            expect(shopsService.remove).toHaveBeenCalledWith('1', 'user-123');
        });
    });
});
