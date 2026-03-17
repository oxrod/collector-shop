import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    @Get()
    @ApiOperation({ summary: 'Lister tous les articles' })
    @ApiResponse({ status: 200, description: 'Liste des articles' })
    findAll() {
        return this.articlesService.findAll();
    }

    @Get('recommended')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Articles recommandés selon centres d\'intérêt' })
    @ApiResponse({ status: 200, description: 'Articles recommandés' })
    findRecommended(@Request() req: any) {
        return this.articlesService.findRecommended(req.user.sub);
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
    create(@Body() createArticleDto: CreateArticleDto, @Request() req: any) {
        return this.articlesService.create(createArticleDto, req.user.sub);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Modifier un article' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateArticleDto: UpdateArticleDto,
        @Request() req: any,
    ) {
        return this.articlesService.update(id, updateArticleDto, req.user.sub);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Supprimer un article' })
    remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        return this.articlesService.remove(id, req.user.sub);
    }
}

