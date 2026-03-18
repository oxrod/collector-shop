import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/article.entity';
import { Transaction } from '../payments/transaction.entity';
import { UsersModule } from '../users/users.module';
import { ChatMessage } from './chat-message.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
    imports: [
        UsersModule,
        TypeOrmModule.forFeature([ChatMessage, Article, Transaction]),
    ],
    controllers: [ChatController],
    providers: [ChatService],
})
export class ChatModule { }

