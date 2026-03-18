import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KeycloakStrategy } from './keycloak.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RolesGuard } from './roles.guard';

@Module({
    imports: [PassportModule.register({ defaultStrategy: 'jwt' }), UsersModule],
    controllers: [AuthController],
    providers: [KeycloakStrategy, JwtAuthGuard, RolesGuard],
    exports: [PassportModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule { }
