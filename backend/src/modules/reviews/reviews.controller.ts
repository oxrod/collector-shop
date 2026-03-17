import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Poster un avis après une transaction' })
    @ApiResponse({ status: 201, description: 'Avis créé' })
    create(
        @Body() body: { reviewedId: string; transactionId: string; rating: number; comment?: string },
        @Request() req: any,
    ) {
        return this.reviewsService.create(
            req.user.sub,
            body.reviewedId,
            body.transactionId,
            body.rating,
            body.comment,
        );
    }

    @Get('user/:id')
    @ApiOperation({ summary: 'Obtenir les avis reçus par un utilisateur' })
    findByUser(@Param('id', ParseUUIDPipe) id: string) {
        return this.reviewsService.findByUser(id);
    }

    @Get('user/:id/rating')
    @ApiOperation({ summary: "Obtenir la note moyenne d'un utilisateur" })
    getAverageRating(@Param('id', ParseUUIDPipe) id: string) {
        return this.reviewsService.getAverageRating(id);
    }

    @Get('transaction/:id')
    @ApiOperation({ summary: "Obtenir les avis d'une transaction" })
    findByTransaction(@Param('id', ParseUUIDPipe) id: string) {
        return this.reviewsService.findByTransaction(id);
    }
}
