jest.mock('stripe', () => {
    const mockPaymentIntentsCreate = jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'secret_test_123',
    });
    const MockStripe = function () {
        return {
            paymentIntents: {
                create: mockPaymentIntentsCreate,
            },
        };
    };
    return { __esModule: true, default: MockStripe };
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from '../src/modules/payments/payments.service';
import { PaymentsController } from '../src/modules/payments/payments.controller';
import { Transaction } from '../src/modules/payments/transaction.entity';

const mockTransactionRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
};

describe('PaymentsService', () => {
    let service: PaymentsService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentsService,
                {
                    provide: getRepositoryToken(Transaction),
                    useValue: mockTransactionRepository,
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('sk_test_placeholder'),
                    },
                },
            ],
        }).compile();

        service = module.get<PaymentsService>(PaymentsService);
        configService = module.get<ConfigService>(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createPaymentIntent', () => {
        it('should create a payment intent and transaction with 5% commission', async () => {
            const articleId = 'article-1';
            const buyerId = 'buyer-1';
            const sellerId = 'seller-1';
            const amount = 100;
            const savedTransaction = {
                id: 'tx-uuid',
                articleId,
                buyerId,
                sellerId,
                amount,
                commission: 5,
                stripePaymentId: 'pi_test_123',
                status: 'pending',
            };

            mockTransactionRepository.create.mockReturnValue({
                ...savedTransaction,
                articleId,
                buyerId,
                sellerId,
                amount,
                commission: 5,
                stripePaymentId: 'pi_test_123',
                status: 'pending',
            });
            mockTransactionRepository.save.mockResolvedValue(savedTransaction);

            const result = await service.createPaymentIntent(
                articleId,
                buyerId,
                sellerId,
                amount,
            );

            expect(result).toEqual({
                clientSecret: 'secret_test_123',
                transactionId: 'tx-uuid',
            });
            expect(mockTransactionRepository.create).toHaveBeenCalledWith({
                articleId,
                buyerId,
                sellerId,
                amount,
                commission: 5,
                stripePaymentId: 'pi_test_123',
                status: 'pending',
            });
            expect(mockTransactionRepository.save).toHaveBeenCalled();
        });
    });

    describe('confirmPayment', () => {
        it('should update transaction status to completed', async () => {
            const transaction = {
                id: 'tx-1',
                status: 'pending',
            };
            const savedTransaction = { ...transaction, status: 'completed' };
            mockTransactionRepository.findOne.mockResolvedValue(transaction);
            mockTransactionRepository.save.mockResolvedValue(savedTransaction);

            const result = await service.confirmPayment('tx-1');

            expect(result).toEqual(savedTransaction);
            expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'tx-1' },
            });
            expect(transaction.status).toBe('completed');
            expect(mockTransactionRepository.save).toHaveBeenCalledWith(transaction);
        });

        it('should throw when transaction not found', async () => {
            mockTransactionRepository.findOne.mockResolvedValue(null);

            await expect(service.confirmPayment('non-existent')).rejects.toThrow(
                'Transaction not found',
            );
        });
    });

    describe('getTransactionsByUser', () => {
        it('should return transactions for buyer or seller', async () => {
            const transactions = [
                {
                    id: 'tx-1',
                    buyerId: 'user-1',
                    sellerId: 'user-2',
                    article: {},
                    buyer: {},
                    seller: {},
                },
            ];
            mockTransactionRepository.find.mockResolvedValue(transactions);

            const result = await service.getTransactionsByUser('user-1');

            expect(result).toEqual(transactions);
            expect(mockTransactionRepository.find).toHaveBeenCalledWith({
                where: [{ buyerId: 'user-1' }, { sellerId: 'user-1' }],
                relations: ['article', 'buyer', 'seller'],
                order: { createdAt: 'DESC' },
            });
        });
    });
});

describe('PaymentsController', () => {
    let controller: PaymentsController;
    let paymentsService: {
        createPaymentIntent: jest.Mock;
        confirmPayment: jest.Mock;
        getTransactionsByUser: jest.Mock;
    };

    beforeEach(async () => {
        paymentsService = {
            createPaymentIntent: jest.fn(),
            confirmPayment: jest.fn(),
            getTransactionsByUser: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentsController],
            providers: [
                {
                    provide: PaymentsService,
                    useValue: paymentsService,
                },
            ],
        }).compile();

        controller = module.get<PaymentsController>(PaymentsController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createPaymentIntent', () => {
        it('should delegate to paymentsService.createPaymentIntent with req.user.sub as buyerId', async () => {
            const body = {
                articleId: 'article-1',
                sellerId: 'seller-1',
                amount: 100,
            };
            const req = { user: { sub: 'buyer-uuid' } };
            const result = {
                clientSecret: 'secret_test_123',
                transactionId: 'tx-uuid',
            };
            paymentsService.createPaymentIntent.mockResolvedValue(result);

            const response = await controller.createPaymentIntent(body, req);

            expect(response).toEqual(result);
            expect(paymentsService.createPaymentIntent).toHaveBeenCalledWith(
                body.articleId,
                'buyer-uuid',
                body.sellerId,
                body.amount,
            );
        });
    });

    describe('confirmPayment', () => {
        it('should delegate to paymentsService.confirmPayment with transactionId from body', async () => {
            const body = { transactionId: 'tx-1' };
            const confirmed = { id: 'tx-1', status: 'completed' };
            paymentsService.confirmPayment.mockResolvedValue(confirmed);

            const result = await controller.confirmPayment(body);

            expect(result).toEqual(confirmed);
            expect(paymentsService.confirmPayment).toHaveBeenCalledWith(body.transactionId);
        });
    });

    describe('getMyTransactions', () => {
        it('should delegate to paymentsService.getTransactionsByUser with req.user.sub', async () => {
            const req = { user: { sub: 'user-uuid' } };
            const transactions = [{ id: 'tx-1', buyerId: 'user-uuid' }];
            paymentsService.getTransactionsByUser.mockResolvedValue(transactions);

            const result = await controller.getMyTransactions(req);

            expect(result).toEqual(transactions);
            expect(paymentsService.getTransactionsByUser).toHaveBeenCalledWith('user-uuid');
        });
    });
});
