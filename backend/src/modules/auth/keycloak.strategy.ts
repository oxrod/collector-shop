import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly configService: ConfigService) {
        const keycloakUrl = configService.get('KEYCLOAK_URL', 'http://localhost:8080');
        const realm = configService.get('KEYCLOAK_REALM', 'marketplace');

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            audience: configService.get('KEYCLOAK_CLIENT_ID', 'marketplace-app'),
            issuer: `${keycloakUrl}/realms/${realm}`,
            algorithms: ['RS256'],
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`,
            }),
        });
    }

    async validate(payload: any) {
        return {
            sub: payload.sub,
            email: payload.email,
            preferred_username: payload.preferred_username,
            roles: payload.realm_access?.roles || [],
        };
    }
}
