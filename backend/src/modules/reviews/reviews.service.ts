import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
    ) { }

    async create(
        reviewerId: string,
        reviewedId: string,
        transactionId: string,
        rating: number,
        comment?: string,
    ): Promise<Review> {
        const review = this.reviewRepository.create({
            reviewerId,
            reviewedId,
            transactionId,
            rating,
            comment,
        });
        return this.reviewRepository.save(review);
    }

    async findByUser(userId: string): Promise<Review[]> {
        return this.reviewRepository.find({
            where: { reviewedId: userId },
            relations: ['reviewer', 'transaction'],
            order: { createdAt: 'DESC' },
        });
    }

    async getAverageRating(userId: string): Promise<{ average: number; count: number }> {
        const result = await this.reviewRepository
            .createQueryBuilder('review')
            .select('AVG(review.rating)', 'average')
            .addSelect('COUNT(review.id)', 'count')
            .where('review.reviewed_id = :userId', { userId })
            .getRawOne();

        return {
            average: result?.average ? parseFloat(result.average) : 0,
            count: parseInt(result?.count || '0', 10),
        };
    }

    async findByTransaction(transactionId: string): Promise<Review[]> {
        return this.reviewRepository.find({
            where: { transactionId },
            relations: ['reviewer', 'reviewed'],
        });
    }
}
