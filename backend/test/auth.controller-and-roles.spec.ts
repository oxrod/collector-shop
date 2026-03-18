import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/modules/auth/auth.controller';
import { RolesGuard } from '../src/modules/auth/roles.guard';
import { Roles, ROLES_KEY } from '../src/modules/auth/roles.decorator';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../src/modules/users/users.service';

describe('AuthController.register', () => {
    it('should return 400-like response when email already exists', async () => {
        const mockUsersService = {
            findAll: jest.fn().mockResolvedValue([{ id: 'existing-1', email: 'a@test.com' }]),
            userRepository: {},
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: UsersService, useValue: mockUsersService },
                { provide: ConfigService, useValue: {} },
            ],
        }).compile();

        const controller = module.get<AuthController>(AuthController);

        const result = await controller.register({
            email: 'a@test.com',
            username: 'alice',
            password: 'secret',
        } as any);

        expect(result).toEqual({
            statusCode: 400,
            message: 'Un utilisateur avec cet email existe déjà.',
        });
    });

    it('should create and return a new user with role=admin when email does not exist', async () => {
        const mockUserRepository = {
            create: jest.fn((input: any) => input),
            save: jest.fn().mockResolvedValue({
                id: '1',
                email: 'new@test.com',
                username: 'newuser',
                role: 'admin',
            }),
        };

        const mockUsersService = {
            findAll: jest.fn().mockResolvedValue([]),
            userRepository: mockUserRepository,
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: UsersService, useValue: mockUsersService },
                { provide: ConfigService, useValue: {} },
            ],
        }).compile();

        const controller = module.get<AuthController>(AuthController);

        const result = await controller.register({
            email: 'new@test.com',
            username: 'newuser',
            password: 'secret',
        } as any);

        expect(mockUserRepository.create).toHaveBeenCalledWith({
            keycloakId: 'new@test.com',
            email: 'new@test.com',
            username: 'newuser',
            role: 'admin',
            isActive: true,
        });
        expect(mockUserRepository.save).toHaveBeenCalled();
        expect(result).toEqual({
            id: '1',
            email: 'new@test.com',
            username: 'newuser',
            role: 'admin',
        });
    });
});

describe('Roles decorator + RolesGuard', () => {
    it('Roles(...) should attach metadata under ROLES_KEY', () => {
        class TestClass {
            method() {
                return true;
            }
        }

        const descriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, 'method')!;
        Roles('admin', 'seller')(
            TestClass.prototype,
            'method',
            descriptor,
        );

        const metadataOnPrototype = Reflect.getMetadata(
            ROLES_KEY,
            TestClass.prototype,
            'method',
        );
        const metadataOnMethodFn = Reflect.getMetadata(
            ROLES_KEY,
            (TestClass.prototype as any).method,
        );

        expect(metadataOnPrototype ?? metadataOnMethodFn).toEqual([
            'admin',
            'seller',
        ]);
    });

    const makeContext = (request: any) =>
        ({
            getHandler: () => ({}),
            getClass: () => ({}),
            switchToHttp: () => ({
                getRequest: () => request,
            }),
        }) as any;

    it('RolesGuard should return true when no roles are required', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(undefined),
        };

        const guard = new RolesGuard(reflector as any);
        const ctx = makeContext({ user: { appRoles: ['buyer'] } });

        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('RolesGuard should return false when required roles exist but request.user is missing', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(['admin']),
        };

        const guard = new RolesGuard(reflector as any);
        const ctx = makeContext({});

        expect(guard.canActivate(ctx)).toBe(false);
    });

    it('RolesGuard should return false when user.appRoles is not an array', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(['admin']),
        };

        const guard = new RolesGuard(reflector as any);
        const ctx = makeContext({ user: { appRoles: 'admin' } });

        expect(guard.canActivate(ctx)).toBe(false);
    });

    it('RolesGuard should return true when user has at least one required role', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(['admin', 'buyer']),
        };

        const guard = new RolesGuard(reflector as any);
        const ctx = makeContext({ user: { appRoles: ['seller', 'buyer'] } });

        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('RolesGuard should return false when user does not have required roles', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(['admin']),
        };

        const guard = new RolesGuard(reflector as any);
        const ctx = makeContext({ user: { appRoles: ['buyer'] } });

        expect(guard.canActivate(ctx)).toBe(false);
    });
});

