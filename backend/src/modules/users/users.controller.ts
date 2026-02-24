import { Controller, Get, Param, ParseUUIDPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtenir le profil utilisateur courant' })
    async getMe(@Request() req: any) {
        return this.usersService.findOrCreate(
            req.user.sub,
            req.user.email,
            req.user.preferred_username,
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtenir un utilisateur par ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.findOne(id);
    }
}
