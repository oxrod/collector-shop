import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../src/modules/auth/jwt-auth.guard';
import { KeycloakStrategy } from '../src/modules/auth/keycloak.strategy';

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtAuthGuard],
        }).compile();

        guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });
});

describe('KeycloakStrategy', () => {
    it('should validate payload and return user object with mapped roles', async () => {
        const payload = {
            sub: 'user-123',
            email: 'test@test.com',
            preferred_username: 'testuser',
            realm_access: { roles: ['buyer'] },
        };
        const result = await KeycloakStrategy.prototype.validate.call({}, payload);
        expect(result).toEqual({
            sub: 'user-123',
            email: 'test@test.com',
            preferred_username: 'testuser',
            realmRoles: ['buyer'],
            appRoles: ['buyer'],
        });
    });

    it('should return empty roles when realm_access is missing', async () => {
        const payload = {
            sub: 'user-456',
            email: 'test2@test.com',
            preferred_username: 'testuser2',
        };
        const result = await KeycloakStrategy.prototype.validate.call({}, payload);
        expect(result).toEqual({
            sub: 'user-456',
            email: 'test2@test.com',
            preferred_username: 'testuser2',
            realmRoles: [],
            appRoles: [],
        });
    });
});
