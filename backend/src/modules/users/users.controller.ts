import { Controller, Get, Post, Delete, Param, Body, ParseUUIDPipe, UseGuards, Request } from '@nestjs/common';
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

    @Get('me/interests')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lister mes centres d\'intérêt' })
    async getMyInterests(@Request() req: any) {
        return this.usersService.getInterests(req.user.sub);
    }

    @Post('me/interests')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Ajouter un centre d\'intérêt' })
    async addInterest(@Body() body: { categoryId: string }, @Request() req: any) {
        return this.usersService.addInterest(req.user.sub, body.categoryId);
    }

    @Delete('me/interests/:categoryId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Retirer un centre d\'intérêt' })
    async removeInterest(@Param('categoryId', ParseUUIDPipe) categoryId: string, @Request() req: any) {
        return this.usersService.removeInterest(req.user.sub, categoryId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtenir un utilisateur par ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.findOne(id);
    }
}

