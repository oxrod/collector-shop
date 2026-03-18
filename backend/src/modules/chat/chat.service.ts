import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../articles/article.entity';
import { Transaction } from '../payments/transaction.entity';
import { UsersService } from '../users/users.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { ChatMessage } from './chat-message.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatMessage)
        private readonly chatRepository: Repository<ChatMessage>,
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly usersService: UsersService,
    ) { }

    async getMessages(articleId: string): Promise<ChatMessage[]> {
        return this.chatRepository.find({
            where: { articleId },
            relations: ['sender'],
            order: { createdAt: 'ASC' },
        });
    }

    async sendMessage(articleId: string, dto: CreateChatMessageDto, req: any): Promise<ChatMessage> {
        const sender = await this.usersService.findOrCreate(
            req.user.sub,
            req.user.email,
            req.user.preferred_username,
            req.user.appRoles,
        );

        const content = dto.content?.trim();
        if (!content) {
            throw new BadRequestException('Message content cannot be empty');
        }

        const article = await this.articleRepository.findOne({ where: { id: articleId } });
        if (!article) {
            throw new NotFoundException(`Article ${articleId} not found`);
        }

        let receiverId = dto.receiverId?.trim();
        if (!receiverId) {
            receiverId = await this.inferReceiverId(articleId, sender.id, article.sellerId);
        }

        if (!receiverId) {
            throw new BadRequestException('receiverId is required');
        }

        // Validate receiver exists (and avoid creating messages with random IDs)
        await this.usersService.findOne(receiverId);

        const message = this.chatRepository.create({
            articleId,
            senderId: sender.id,
            receiverId,
            content,
            sender,
        });

        const saved = await this.chatRepository.save(message);

        return this.chatRepository.findOneOrFail({
            where: { id: saved.id },
            relations: ['sender'],
        });
    }

    private async inferReceiverId(articleId: string, senderId: string, sellerId: string): Promise<string | undefined> {
        // Default: buyer contacting seller
        if (senderId !== sellerId) {
            return sellerId;
        }

        // Seller contacting buyer: infer from transactions (best signal)
        const latestTx = await this.transactionRepository.findOne({
            where: { articleId, sellerId },
            order: { createdAt: 'DESC' },
        });
        if (latestTx?.buyerId) {
            return latestTx.buyerId;
        }

        // Fallback: infer from existing chat messages (room already exists)
        const lastMessage = await this.chatRepository.findOne({
            where: [
                { articleId, senderId },
                { articleId, receiverId: senderId },
            ],
            order: { createdAt: 'DESC' },
        });

        if (!lastMessage) return undefined;
        return lastMessage.senderId === senderId
            ? (lastMessage.receiverId ?? undefined)
            : lastMessage.senderId;
    }
}

