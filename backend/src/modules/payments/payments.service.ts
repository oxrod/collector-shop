import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Transaction } from './transaction.entity';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;

    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly configService: ConfigService,
    ) {
        this.stripe = new Stripe(
            this.configService.get('STRIPE_SECRET_KEY', 'sk_test_placeholder'),
            { apiVersion: '2023-10-16' },
        );
    }

    async createPaymentIntent(
        articleId: string,
        buyerId: string,
        sellerId: string,
        amount: number,
    ): Promise<{ clientSecret: string; transactionId: string }> {
        // Create Stripe PaymentIntent
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects cents
            currency: 'eur',
            metadata: { articleId, buyerId, sellerId },
        });

        // Create transaction record
        const transaction = this.transactionRepository.create({
            articleId,
            buyerId,
            sellerId,
            amount,
            stripePaymentId: paymentIntent.id,
            status: 'pending',
        });
        await this.transactionRepository.save(transaction);

        return {
            clientSecret: paymentIntent.client_secret!,
            transactionId: transaction.id,
        };
    }

    async confirmPayment(transactionId: string): Promise<Transaction> {
        const transaction = await this.transactionRepository.findOne({
            where: { id: transactionId },
        });
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        transaction.status = 'completed';
        return this.transactionRepository.save(transaction);
    }

    async getTransactionsByUser(userId: string): Promise<Transaction[]> {
        return this.transactionRepository.find({
            where: [{ buyerId: userId }, { sellerId: userId }],
            relations: ['article', 'buyer', 'seller'],
            order: { createdAt: 'DESC' },
        });
    }
}
