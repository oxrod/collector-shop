import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Article } from './article.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ArticlesService {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
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

    async create(createArticleDto: CreateArticleDto, sellerId: string): Promise<Article> {
        const article = this.articleRepository.create({
            ...createArticleDto,
            sellerId,
            status: 'pending',
        });

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
        } catch (error) {
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
        Object.assign(article, updateArticleDto);
        return this.articleRepository.save(article);
    }

    async remove(id: string, sellerId: string): Promise<void> {
        const article = await this.findOne(id);
        if (article.sellerId !== sellerId) {
            throw new ForbiddenException('You can only delete your own articles');
        }
        await this.articleRepository.remove(article);
    }
}
