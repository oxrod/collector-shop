import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Patch,
    Body,
    Param,
    UseGuards,
    Request,
    ParseUUIDPipe,
    ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
    constructor(
        private readonly articlesService: ArticlesService,
        private readonly usersService: UsersService,
    ) { }

    private assertAdmin(req: any) {
        const roles = req?.user?.appRoles ?? [];
        if (!Array.isArray(roles) || !roles.includes('admin')) {
            throw new ForbiddenException('Admin access required');
        }
    }

    @Get()
    @ApiOperation({ summary: 'Lister tous les articles' })
    @ApiResponse({ status: 200, description: 'Liste des articles' })
    findAll() {
        return this.articlesService.findAll();
    }

    @Get('mine')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mes articles (vendeur connecté)' })
    @ApiResponse({ status: 200, description: 'Liste des articles du vendeur' })
    async findMine(@Request() req: any) {
        const user = await this.usersService.findOrCreate(req.user.sub, req.user.email, req.user.preferred_username);
        return this.articlesService.findBySeller(user.id);
    }

    @Get('admin/pending')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lister les articles en attente (admin)' })
    @ApiResponse({ status: 200, description: 'Liste des articles pending' })
    async findAdminPending(@Request() req: any) {
        this.assertAdmin(req);
        return this.articlesService.findPending();
    }

    @Patch('admin/:id/moderate')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Modérer un article (admin)' })
    @ApiResponse({ status: 200, description: 'Statut mis à jour' })
    async moderateAdmin(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: { status: 'validated' | 'rejected' },
        @Request() req: any,
    ) {
        this.assertAdmin(req);
        return this.articlesService.moderateStatus(id, body.status);
    }

    @Get('recommended')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Articles recommandés selon centres d\'intérêt' })
    @ApiResponse({ status: 200, description: 'Articles recommandés' })
    async findRecommended(@Request() req: any) {
        const user = await this.usersService.findOrCreate(req.user.sub, req.user.email, req.user.preferred_username);
        return this.articlesService.findRecommended(user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtenir un article par ID' })
    @ApiResponse({ status: 200, description: "Détails de l'article" })
    @ApiResponse({ status: 404, description: 'Article non trouvé' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.articlesService.findOne(id);
    }

    @Get(':id/price-history')
    @ApiOperation({ summary: 'Historique de prix d\'un article' })
    @ApiResponse({ status: 200, description: 'Historique des variations de prix' })
    getPriceHistory(@Param('id', ParseUUIDPipe) id: string) {
        return this.articlesService.getPriceHistory(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Publier un nouvel article' })
    @ApiResponse({ status: 201, description: 'Article créé et soumis à validation' })
    async create(@Body() createArticleDto: CreateArticleDto, @Request() req: any) {
        const user = await this.usersService.findOrCreate(req.user.sub, req.user.email, req.user.preferred_username);
        return this.articlesService.create(createArticleDto, user.id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Modifier un article' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateArticleDto: UpdateArticleDto,
        @Request() req: any,
    ) {
        const user = await this.usersService.findOrCreate(req.user.sub, req.user.email, req.user.preferred_username);
        return this.articlesService.update(id, updateArticleDto, user.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Supprimer un article' })
    async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        const user = await this.usersService.findOrCreate(req.user.sub, req.user.email, req.user.preferred_username);
        return this.articlesService.remove(id, user.id);
    }
}

