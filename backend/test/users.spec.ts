import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../src/modules/users/users.service';
import { UsersController } from '../src/modules/users/users.controller';
import { User } from '../src/modules/users/user.entity';
import { UserInterest } from '../src/modules/users/user-interest.entity';

const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
};

const mockUserInterestRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
};

describe('UsersService', () => {
    let service: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: getRepositoryToken(UserInterest),
                    useValue: mockUserInterestRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of users ordered by createdAt DESC', async () => {
            const users = [
                { id: '1', email: 'a@test.com', username: 'user1' },
                { id: '2', email: 'b@test.com', username: 'user2' },
            ];
            mockUserRepository.find.mockResolvedValue(users);

            const result = await service.findAll();
            expect(result).toEqual(users);
            expect(mockUserRepository.find).toHaveBeenCalledWith({
                order: { createdAt: 'DESC' },
            });
        });
    });

    describe('findOne', () => {
        it('should return a single user', async () => {
            const user = { id: '1', email: 'test@test.com', username: 'testuser' };
            mockUserRepository.findOne.mockResolvedValue(user);

            const result = await service.findOne('1');
            expect(result).toEqual(user);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { id: '1' },
            });
        });

        it('should throw NotFoundException if user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            await expect(service.findOne('non-existent')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('findByKeycloakId', () => {
        it('should return a user by keycloakId', async () => {
            const user = { id: '1', keycloakId: 'kc-123', email: 'test@test.com' };
            mockUserRepository.findOne.mockResolvedValue(user);

            const result = await service.findByKeycloakId('kc-123');
            expect(result).toEqual(user);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { keycloakId: 'kc-123' },
            });
        });

        it('should return null when user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            const result = await service.findByKeycloakId('unknown');
            expect(result).toBeNull();
        });
    });

    describe('findOrCreate', () => {
        it('should return existing user when found', async () => {
            const existingUser = {
                id: '1',
                keycloakId: 'kc-123',
                email: 'test@test.com',
                username: 'testuser',
            };
            mockUserRepository.findOne.mockResolvedValue(existingUser);

            const result = await service.findOrCreate(
                'kc-123',
                'test@test.com',
                'testuser',
            );
            expect(result).toEqual(existingUser);
            expect(mockUserRepository.create).not.toHaveBeenCalled();
            expect(mockUserRepository.save).not.toHaveBeenCalled();
        });

        it('should create and return new user when not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            const newUser = {
                id: '1',
                keycloakId: 'kc-123',
                email: 'new@test.com',
                username: 'newuser',
                role: 'buyer',
            };
            mockUserRepository.create.mockReturnValue({
                keycloakId: 'kc-123',
                email: 'new@test.com',
                username: 'newuser',
                role: 'buyer',
            });
            mockUserRepository.save.mockResolvedValue(newUser);

            const result = await service.findOrCreate(
                'kc-123',
                'new@test.com',
                'newuser',
            );
            expect(result).toEqual(newUser);
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                keycloakId: 'kc-123',
                email: 'new@test.com',
                username: 'newuser',
                role: 'buyer',
            });
            expect(mockUserRepository.save).toHaveBeenCalled();
        });
    });

    describe('updateRole', () => {
        it('should update user role and return user', async () => {
            const user = {
                id: '1',
                email: 'test@test.com',
                role: 'buyer',
            };
            const updatedUser = { ...user, role: 'seller' };
            mockUserRepository.findOne.mockResolvedValue(user);
            mockUserRepository.save.mockResolvedValue(updatedUser);

            const result = await service.updateRole('1', 'seller');
            expect(result).toEqual(updatedUser);
            expect(user.role).toBe('seller');
            expect(mockUserRepository.save).toHaveBeenCalledWith(user);
        });

        it('should throw NotFoundException if user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            await expect(service.updateRole('non-existent', 'admin')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('getInterests', () => {
        it('should return user interests with category relation', async () => {
            const interests = [
                { id: '1', userId: 'u1', categoryId: 'c1', category: { name: 'Cat1' } },
            ];
            mockUserInterestRepository.find.mockResolvedValue(interests);

            const result = await service.getInterests('u1');
            expect(result).toEqual(interests);
            expect(mockUserInterestRepository.find).toHaveBeenCalledWith({
                where: { userId: 'u1' },
                relations: ['category'],
            });
        });
    });

    describe('addInterest', () => {
        it('should return existing interest when already present', async () => {
            const existing = { id: '1', userId: 'u1', categoryId: 'c1' };
            mockUserInterestRepository.findOne.mockResolvedValue(existing);

            const result = await service.addInterest('u1', 'c1');
            expect(result).toEqual(existing);
            expect(mockUserInterestRepository.create).not.toHaveBeenCalled();
            expect(mockUserInterestRepository.save).not.toHaveBeenCalled();
        });

        it('should create and save new interest when not present', async () => {
            mockUserInterestRepository.findOne.mockResolvedValue(null);
            const newInterest = { id: '1', userId: 'u1', categoryId: 'c1' };
            mockUserInterestRepository.create.mockReturnValue({
                userId: 'u1',
                categoryId: 'c1',
            });
            mockUserInterestRepository.save.mockResolvedValue(newInterest);

            const result = await service.addInterest('u1', 'c1');
            expect(result).toEqual(newInterest);
            expect(mockUserInterestRepository.create).toHaveBeenCalledWith({
                userId: 'u1',
                categoryId: 'c1',
            });
            expect(mockUserInterestRepository.save).toHaveBeenCalled();
        });
    });

    describe('removeInterest', () => {
        it('should delete user interest', async () => {
            mockUserInterestRepository.delete.mockResolvedValue({ affected: 1 });

            await service.removeInterest('u1', 'c1');
            expect(mockUserInterestRepository.delete).toHaveBeenCalledWith({
                userId: 'u1',
                categoryId: 'c1',
            });
        });
    });
});

describe('UsersController', () => {
    let controller: UsersController;
    let usersService: {
        findOrCreate: jest.Mock;
        getInterests: jest.Mock;
        addInterest: jest.Mock;
        removeInterest: jest.Mock;
        findOne: jest.Mock;
    };

    beforeEach(async () => {
        usersService = {
            findOrCreate: jest.fn(),
            getInterests: jest.fn(),
            addInterest: jest.fn(),
            removeInterest: jest.fn(),
            findOne: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: usersService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getMe', () => {
        it('should delegate to usersService.findOrCreate with req.user data', async () => {
            const req = {
                user: {
                    sub: 'kc-123',
                    email: 'test@test.com',
                    preferred_username: 'testuser',
                },
            };
            const user = { id: '1', email: 'test@test.com', username: 'testuser' };
            usersService.findOrCreate.mockResolvedValue(user);

            const result = await controller.getMe(req);
            expect(result).toEqual(user);
            expect(usersService.findOrCreate).toHaveBeenCalledWith(
                'kc-123',
                'test@test.com',
                'testuser',
            );
        });
    });

    describe('getMyInterests', () => {
        it('should delegate to usersService.getInterests with req.user.sub', async () => {
            const req = { user: { sub: 'kc-123' } };
            const interests = [{ id: '1', categoryId: 'c1' }];
            usersService.getInterests.mockResolvedValue(interests);

            const result = await controller.getMyInterests(req);
            expect(result).toEqual(interests);
            expect(usersService.getInterests).toHaveBeenCalledWith('kc-123');
        });
    });

    describe('addInterest', () => {
        it('should delegate to usersService.addInterest with body.categoryId and req.user.sub', async () => {
            const req = { user: { sub: 'kc-123' } };
            const body = { categoryId: 'cat-1' };
            const interest = { id: '1', userId: 'kc-123', categoryId: 'cat-1' };
            usersService.addInterest.mockResolvedValue(interest);

            const result = await controller.addInterest(body, req);
            expect(result).toEqual(interest);
            expect(usersService.addInterest).toHaveBeenCalledWith('kc-123', 'cat-1');
        });
    });

    describe('removeInterest', () => {
        it('should delegate to usersService.removeInterest with categoryId and req.user.sub', async () => {
            const req = { user: { sub: 'kc-123' } };
            usersService.removeInterest.mockResolvedValue(undefined);

            await controller.removeInterest('cat-1', req);
            expect(usersService.removeInterest).toHaveBeenCalledWith(
                'kc-123',
                'cat-1',
            );
        });
    });

    describe('findOne', () => {
        it('should delegate to usersService.findOne with id', async () => {
            const user = { id: '1', email: 'test@test.com', username: 'testuser' };
            usersService.findOne.mockResolvedValue(user);

            const result = await controller.findOne('1');
            expect(result).toEqual(user);
            expect(usersService.findOne).toHaveBeenCalledWith('1');
        });
    });
});
