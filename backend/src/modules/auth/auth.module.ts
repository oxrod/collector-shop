import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KeycloakStrategy } from './keycloak.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
    imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
    providers: [KeycloakStrategy, JwtAuthGuard],
    exports: [PassportModule, JwtAuthGuard],
})
export class AuthModule { }
