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
import { ShopsService } from './shops.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Shops')
@Controller('shops')
export class ShopsController {
    constructor(private readonly shopsService: ShopsService) { }

    @Get()
    @ApiOperation({ summary: 'Lister toutes les boutiques' })
    @ApiResponse({ status: 200, description: 'Liste des boutiques' })
    findAll() {
        return this.shopsService.findAll();
    }

    @Get('mine')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lister mes boutiques' })
    findMine(@Request() req: any) {
        return this.shopsService.findByOwner(req.user.sub);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtenir une boutique par ID' })
    @ApiResponse({ status: 404, description: 'Boutique non trouvée' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.shopsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Créer une boutique' })
    @ApiResponse({ status: 201, description: 'Boutique créée' })
    create(
        @Body() body: { name: string; description?: string },
        @Request() req: any,
    ) {
        return this.shopsService.create(body.name, body.description || '', req.user.sub);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Modifier une boutique' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: { name?: string; description?: string },
        @Request() req: any,
    ) {
        return this.shopsService.update(id, body.name!, body.description!, req.user.sub);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Supprimer une boutique' })
    remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        return this.shopsService.remove(id, req.user.sub);
    }
}
