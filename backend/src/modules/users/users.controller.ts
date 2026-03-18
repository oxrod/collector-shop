import {
    Controller,
    Get,
    Post,
    Delete,
    Patch,
    Param,
    Body,
    ParseUUIDPipe,
    UseGuards,
    Request,
    ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    private assertAdmin(req: any) {
        const roles = req?.user?.appRoles ?? [];
        if (!Array.isArray(roles) || !roles.includes('admin')) {
            throw new ForbiddenException('Admin access required');
        }
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtenir le profil utilisateur courant' })
    async getMe(@Request() req: any) {
        return this.usersService.findOrCreate(
            req.user.sub,
            req.user.email,
            req.user.preferred_username,
            req.user.appRoles,
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

    @Get('admin/moderation')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Lister les utilisateurs à modérer (admin)" })
    async getAdminModerationUsers(@Request() req: any) {
        this.assertAdmin(req);
        const users = await this.usersService.findAll();
        // Simple queue for now: everything except admins
        return users.filter((u) => u.role !== 'admin');
    }

    @Patch('admin/:id/role')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Mettre à jour le rôle d'un utilisateur (admin)" })
    async updateUserRole(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: { role: 'buyer' | 'seller' | 'admin' },
        @Request() req: any,
    ) {
        this.assertAdmin(req);
        return this.usersService.updateRole(id, body.role);
    }
}

