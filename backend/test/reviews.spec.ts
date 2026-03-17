import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReviewsService } from '../src/modules/reviews/reviews.service';
import { ReviewsController } from '../src/modules/reviews/reviews.controller';
import { Review } from '../src/modules/reviews/review.entity';

const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
};

const mockReviewRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

describe('ReviewsService', () => {
    let service: ReviewsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewsService,
                {
                    provide: getRepositoryToken(Review),
                    useValue: mockReviewRepository,
                },
            ],
        }).compile();

        service = module.get<ReviewsService>(ReviewsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create and return a review', async () => {
            const review = {
                id: 'review-uuid',
                reviewerId: 'reviewer-1',
                reviewedId: 'reviewed-1',
                transactionId: 'tx-1',
                rating: 5,
                comment: 'Great!',
            };
            mockReviewRepository.create.mockReturnValue({
                reviewerId: 'reviewer-1',
                reviewedId: 'reviewed-1',
                transactionId: 'tx-1',
                rating: 5,
                comment: 'Great!',
            });
            mockReviewRepository.save.mockResolvedValue(review);

            const result = await service.create(
                'reviewer-1',
                'reviewed-1',
                'tx-1',
                5,
                'Great!',
            );
            expect(result).toEqual(review);
            expect(mockReviewRepository.create).toHaveBeenCalledWith({
                reviewerId: 'reviewer-1',
                reviewedId: 'reviewed-1',
                transactionId: 'tx-1',
                rating: 5,
                comment: 'Great!',
            });
            expect(mockReviewRepository.save).toHaveBeenCalled();
        });

        it('should create a review without comment', async () => {
            const review = {
                id: 'review-uuid',
                reviewerId: 'r1',
                reviewedId: 'u1',
                transactionId: 'tx-1',
                rating: 4,
                comment: null,
            };
            mockReviewRepository.create.mockReturnValue({});
            mockReviewRepository.save.mockResolvedValue(review);

            const result = await service.create('r1', 'u1', 'tx-1', 4);
            expect(result).toEqual(review);
            expect(mockReviewRepository.create).toHaveBeenCalledWith({
                reviewerId: 'r1',
                reviewedId: 'u1',
                transactionId: 'tx-1',
                rating: 4,
                comment: undefined,
            });
        });
    });

    describe('findByUser', () => {
        it('should return reviews for a user ordered by createdAt DESC', async () => {
            const reviews = [
                {
                    id: '1',
                    reviewedId: 'user-1',
                    rating: 5,
                    reviewer: {},
                    transaction: {},
                },
            ];
            mockReviewRepository.find.mockResolvedValue(reviews);

            const result = await service.findByUser('user-1');
            expect(result).toEqual(reviews);
            expect(mockReviewRepository.find).toHaveBeenCalledWith({
                where: { reviewedId: 'user-1' },
                relations: ['reviewer', 'transaction'],
                order: { createdAt: 'DESC' },
            });
        });
    });

    describe('getAverageRating', () => {
        it('should return average and count when result has values', async () => {
            mockQueryBuilder.getRawOne.mockResolvedValue({
                average: '4.5',
                count: '10',
            });

            const result = await service.getAverageRating('user-1');
            expect(result).toEqual({ average: 4.5, count: 10 });
            expect(mockReviewRepository.createQueryBuilder).toHaveBeenCalledWith('review');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith('AVG(review.rating)', 'average');
            expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('COUNT(review.id)', 'count');
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('review.reviewed_id = :userId', {
                userId: 'user-1',
            });
        });

        it('should return 0 average and 0 count when result is null', async () => {
            mockQueryBuilder.getRawOne.mockResolvedValue(null);

            const result = await service.getAverageRating('user-1');
            expect(result).toEqual({ average: 0, count: 0 });
        });

        it('should return 0 average and 0 count when result has empty values', async () => {
            mockQueryBuilder.getRawOne.mockResolvedValue({
                average: null,
                count: null,
            });

            const result = await service.getAverageRating('user-1');
            expect(result).toEqual({ average: 0, count: 0 });
        });
    });

    describe('findByTransaction', () => {
        it('should return reviews for a transaction', async () => {
            const reviews = [
                {
                    id: '1',
                    transactionId: 'tx-1',
                    rating: 5,
                    reviewer: {},
                    reviewed: {},
                },
            ];
            mockReviewRepository.find.mockResolvedValue(reviews);

            const result = await service.findByTransaction('tx-1');
            expect(result).toEqual(reviews);
            expect(mockReviewRepository.find).toHaveBeenCalledWith({
                where: { transactionId: 'tx-1' },
                relations: ['reviewer', 'reviewed'],
            });
        });
    });
});

describe('ReviewsController', () => {
    let controller: ReviewsController;
    let reviewsService: {
        create: jest.Mock;
        findByUser: jest.Mock;
        getAverageRating: jest.Mock;
        findByTransaction: jest.Mock;
    };

    beforeEach(async () => {
        reviewsService = {
            create: jest.fn(),
            findByUser: jest.fn(),
            getAverageRating: jest.fn(),
            findByTransaction: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReviewsController],
            providers: [
                {
                    provide: ReviewsService,
                    useValue: reviewsService,
                },
            ],
        }).compile();

        controller = module.get<ReviewsController>(ReviewsController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should delegate to reviewsService.create with user sub and body', async () => {
            const body = {
                reviewedId: 'reviewed-1',
                transactionId: 'tx-1',
                rating: 5,
                comment: 'Nice',
            };
            const req = { user: { sub: 'reviewer-uuid' } };
            const created = { id: '1', ...body };
            reviewsService.create.mockResolvedValue(created);

            const result = await controller.create(body, req);
            expect(result).toEqual(created);
            expect(reviewsService.create).toHaveBeenCalledWith(
                'reviewer-uuid',
                body.reviewedId,
                body.transactionId,
                body.rating,
                body.comment,
            );
        });
    });

    describe('findByUser', () => {
        it('should delegate to reviewsService.findByUser with id', async () => {
            const reviews = [{ id: '1', reviewedId: 'user-1', rating: 5 }];
            reviewsService.findByUser.mockResolvedValue(reviews);

            const result = await controller.findByUser('user-1');
            expect(result).toEqual(reviews);
            expect(reviewsService.findByUser).toHaveBeenCalledWith('user-1');
        });
    });

    describe('getAverageRating', () => {
        it('should delegate to reviewsService.getAverageRating with id', async () => {
            const rating = { average: 4.5, count: 10 };
            reviewsService.getAverageRating.mockResolvedValue(rating);

            const result = await controller.getAverageRating('user-1');
            expect(result).toEqual(rating);
            expect(reviewsService.getAverageRating).toHaveBeenCalledWith('user-1');
        });
    });

    describe('findByTransaction', () => {
        it('should delegate to reviewsService.findByTransaction with id', async () => {
            const reviews = [{ id: '1', transactionId: 'tx-1', rating: 5 }];
            reviewsService.findByTransaction.mockResolvedValue(reviews);

            const result = await controller.findByTransaction('tx-1');
            expect(result).toEqual(reviews);
            expect(reviewsService.findByTransaction).toHaveBeenCalledWith('tx-1');
        });
    });
});
