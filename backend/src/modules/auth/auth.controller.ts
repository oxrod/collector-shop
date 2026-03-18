import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    @MaxLength(100)
    password?: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Créer un compte utilisateur',
        description:
            'Crée un compte utilisateur applicatif. Dans un environnement de production, cette route devrait déléguer la création du compte à Keycloak via son API d’administration.',
    })
    async register(@Body() dto: RegisterDto) {
        // NOTE: Pour simplifier et éviter une dépendance forte au client Admin Keycloak,
        // on se contente ici de préparer l’utilisateur côté base de données.
        // L’utilisateur devra toujours finaliser l’inscription / lier son compte via Keycloak.

        const existingByEmail = await this.usersService.findAll().then((users) =>
            users.find((u) => u.email === dto.email),
        );
        if (existingByEmail) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Un utilisateur avec cet email existe déjà.',
            };
        }

        const user = await this.usersService['userRepository'].save(
            this.usersService['userRepository'].create({
                // Pour la preuve de concept, on réutilise l'email comme identifiant Keycloak local.
                // En production, ce champ doit contenir le `sub` renvoyé par Keycloak.
                keycloakId: dto.email,
                email: dto.email,
                username: dto.username,
                // Proof-of-concept: nouveaux comptes avec privilèges admin (inclut les capacités vendeur).
                role: 'admin',
                isActive: true,
            }),
        );

        return {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        };
    }
}

