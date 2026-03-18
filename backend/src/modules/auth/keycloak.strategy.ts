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
        // Keycloak "iss" can differ depending on how the token endpoint is reached
        // (e.g. `localhost` vs `keycloak` in Docker). If issuer doesn't match,
        // Passport-jwt throws 401 even with a valid signature.
        const validateIssuer = configService.get('JWT_VALIDATE_ISSUER', 'false') === 'true';
        const issuer =
            validateIssuer
                ? configService.get('JWT_ISSUER') ?? `${keycloakUrl}/realms/${realm}`
                : undefined;

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // Keycloak doesn't include 'aud' for the client by default;
            // skip audience validation to avoid blanket 401s in dev.
            algorithms: ['RS256'],
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`,
            }),
            ...(issuer ? { issuer } : {}),
        });
    }

    async validate(payload: any) {
        const realmRoles: string[] = payload.realm_access?.roles || [];

        const appRoles: ('admin' | 'seller' | 'buyer')[] = [];
        if (realmRoles.includes('admin')) {
            appRoles.push('admin');
        }
        if (realmRoles.includes('seller')) {
            appRoles.push('seller');
        }
        if (realmRoles.includes('user') || realmRoles.includes('buyer')) {
            appRoles.push('buyer');
        }

        return {
            sub: payload.sub,
            email: payload.email,
            preferred_username: payload.preferred_username,
            realmRoles,
            appRoles,
        };
    }
}
