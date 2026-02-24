import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('create-intent')
    @ApiOperation({ summary: 'Créer une intention de paiement Stripe' })
    async createPaymentIntent(
        @Body() body: { articleId: string; sellerId: string; amount: number },
        @Request() req: any,
    ) {
        return this.paymentsService.createPaymentIntent(
            body.articleId,
            req.user.sub,
            body.sellerId,
            body.amount,
        );
    }

    @Post('confirm')
    @ApiOperation({ summary: 'Confirmer un paiement' })
    async confirmPayment(@Body() body: { transactionId: string }) {
        return this.paymentsService.confirmPayment(body.transactionId);
    }

    @Get('my-transactions')
    @ApiOperation({ summary: 'Lister mes transactions' })
    async getMyTransactions(@Request() req: any) {
        return this.paymentsService.getTransactionsByUser(req.user.sub);
    }
}
