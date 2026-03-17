import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import axios from 'axios';
import { Article } from './article.entity';
import { PriceHistory } from './price-history.entity';
import { UserInterest } from '../users/user-interest.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ArticlesService {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(PriceHistory)
        private readonly priceHistoryRepository: Repository<PriceHistory>,
        @InjectRepository(UserInterest)
        private readonly userInterestRepository: Repository<UserInterest>,
        private readonly configService: ConfigService,
    ) { }

    async findAll(): Promise<Article[]> {
        return this.articleRepository.find({
            relations: ['seller'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Article> {
        const article = await this.articleRepository.findOne({
            where: { id },
            relations: ['seller'],
        });
        if (!article) {
            throw new NotFoundException(`Article ${id} not found`);
        }
        return article;
    }

    async findBySeller(sellerId: string): Promise<Article[]> {
        return this.articleRepository.find({
            where: { sellerId },
            order: { createdAt: 'DESC' },
        });
    }

    async findRecommended(userId: string): Promise<Article[]> {
        const interests = await this.userInterestRepository.find({
            where: { userId },
        });

        if (interests.length === 0) {
            // No interests configured — return latest validated articles
            return this.articleRepository.find({
                where: { status: 'validated' },
                relations: ['seller', 'category'],
                order: { createdAt: 'DESC' },
                take: 20,
            });
        }

        const categoryIds = interests.map((i) => i.categoryId);
        return this.articleRepository.find({
            where: { categoryId: In(categoryIds), status: 'validated' },
            relations: ['seller', 'category'],
            order: { createdAt: 'DESC' },
            take: 20,
        });
    }

    async getPriceHistory(articleId: string): Promise<PriceHistory[]> {
        return this.priceHistoryRepository.find({
            where: { articleId },
            order: { changedAt: 'DESC' },
        });
    }

    async create(createArticleDto: CreateArticleDto, sellerId: string): Promise<Article> {
        const article = this.articleRepository.create({
            ...createArticleDto,
            sellerId,
            status: 'pending' as const,
        } as Partial<Article>);

        const savedArticle = await this.articleRepository.save(article);

        // Validate via Fraud Service
        try {
            const fraudServiceUrl = this.configService.get('FRAUD_SERVICE_URL', 'http://localhost:3002');
            const fraudResponse = await axios.post(`${fraudServiceUrl}/validate`, {
                articleId: savedArticle.id,
                title: savedArticle.title,
                description: savedArticle.description,
                price: savedArticle.price,
            });

            savedArticle.fraudScore = fraudResponse.data.score;
            savedArticle.status = fraudResponse.data.valid ? 'validated' : 'rejected';
            await this.articleRepository.save(savedArticle);

            // Send notification
            const notificationServiceUrl = this.configService.get(
                'NOTIFICATION_SERVICE_URL',
                'http://localhost:3003',
            );
            await axios.post(`${notificationServiceUrl}/notify`, {
                userId: sellerId,
                type: 'article_published',
                title: 'Article publié',
                message: `Votre article "${savedArticle.title}" a été ${savedArticle.status === 'validated' ? 'validé' : 'rejeté'}.`,
            });
        } catch (error: any) {
            console.error('Error calling fraud/notification service:', error.message);
            // Article remains in 'pending' if services are unavailable
        }

        return savedArticle;
    }

    async update(id: string, updateArticleDto: UpdateArticleDto, sellerId: string): Promise<Article> {
        const article = await this.findOne(id);
        if (article.sellerId !== sellerId) {
            throw new ForbiddenException('You can only update your own articles');
        }

        const oldPrice = article.price;
        Object.assign(article, updateArticleDto);
        const savedArticle = await this.articleRepository.save(article);

        // Track price changes & re-validate via fraud service
        if (updateArticleDto.price !== undefined && updateArticleDto.price !== oldPrice) {
            // Record price history
            const priceHistory = this.priceHistoryRepository.create({
                articleId: id,
                oldPrice,
                newPrice: updateArticleDto.price,
            });
            await this.priceHistoryRepository.save(priceHistory);

            try {
                // Re-validate via fraud service
                const fraudServiceUrl = this.configService.get('FRAUD_SERVICE_URL', 'http://localhost:3002');
                const fraudResponse = await axios.post(`${fraudServiceUrl}/validate`, {
                    articleId: savedArticle.id,
                    title: savedArticle.title,
                    description: savedArticle.description,
                    price: savedArticle.price,
                });
                savedArticle.fraudScore = fraudResponse.data.score;
                savedArticle.status = fraudResponse.data.valid ? 'validated' : 'rejected';
                await this.articleRepository.save(savedArticle);

                // Notify about price change
                const notificationServiceUrl = this.configService.get(
                    'NOTIFICATION_SERVICE_URL',
                    'http://localhost:3003',
                );
                await axios.post(`${notificationServiceUrl}/notify`, {
                    userId: sellerId,
                    type: 'price_change',
                    title: 'Prix modifié',
                    message: `Le prix de "${savedArticle.title}" a changé de ${oldPrice}€ à ${savedArticle.price}€.`,
                });
            } catch (error: any) {
                console.error('Error during price change processing:', error.message);
            }
        }

        return savedArticle;
    }

    async remove(id: string, sellerId: string): Promise<void> {
        const article = await this.findOne(id);
        if (article.sellerId !== sellerId) {
            throw new ForbiddenException('You can only delete your own articles');
        }
        await this.articleRepository.remove(article);
    }
}

