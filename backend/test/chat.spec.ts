import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatService } from '../src/modules/chat/chat.service';
import { ChatController } from '../src/modules/chat/chat.controller';
import { ChatMessage } from '../src/modules/chat/chat-message.entity';
import { Article } from '../src/modules/articles/article.entity';
import { Transaction } from '../src/modules/payments/transaction.entity';
import { UsersService } from '../src/modules/users/users.service';

describe('ChatService', () => {
    let service: ChatService;
    let chatRepository: any;
    let articleRepository: any;
    let transactionRepository: any;
    let usersService: any;

    beforeEach(async () => {
        chatRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneOrFail: jest.fn(),
        };
        articleRepository = {
            findOne: jest.fn(),
        };
        transactionRepository = {
            findOne: jest.fn(),
        };
        usersService = {
            findOrCreate: jest.fn(),
            findOne: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatService,
                { provide: UsersService, useValue: usersService },
                { provide: getRepositoryToken(ChatMessage), useValue: chatRepository },
                { provide: getRepositoryToken(Article), useValue: articleRepository },
                { provide: getRepositoryToken(Transaction), useValue: transactionRepository },
            ],
        }).compile();

        service = module.get<ChatService>(ChatService);
    });

    afterEach(() => jest.clearAllMocks());

    describe('getMessages', () => {
        it('should return messages ordered by createdAt ASC for an article', async () => {
            const messages = [{ id: 'm1', articleId: 'a1' }];
            chatRepository.find.mockResolvedValue(messages);

            await expect(service.getMessages('a1')).resolves.toEqual(messages);
            expect(chatRepository.find).toHaveBeenCalledWith({
                where: { articleId: 'a1' },
                relations: ['sender'],
                order: { createdAt: 'ASC' },
            });
        });
    });

    describe('sendMessage', () => {
        it('should throw BadRequestException when content is empty', async () => {
            usersService.findOrCreate.mockResolvedValue({ id: 'sender-1' });

            await expect(
                service.sendMessage(
                    'article-1',
                    { content: '   ' } as any,
                    { user: { sub: 'sender-1', email: 'e', preferred_username: 'u' } } as any,
                ),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException when article is not found', async () => {
            usersService.findOrCreate.mockResolvedValue({ id: 'sender-1' });
            articleRepository.findOne.mockResolvedValue(null);

            await expect(
                service.sendMessage(
                    'missing-article',
                    { content: 'hello', receiverId: 'receiver-1' } as any,
                    { user: { sub: 'sender-1', email: 'e', preferred_username: 'u' } } as any,
                ),
            ).rejects.toThrow(NotFoundException);
        });

        it('should send a message when receiverId is explicitly provided', async () => {
            usersService.findOrCreate.mockResolvedValue({ id: 'sender-1' });
            articleRepository.findOne.mockResolvedValue({ id: 'article-1', sellerId: 'seller-1' });
            usersService.findOne.mockResolvedValue({ id: 'receiver-1' });
            chatRepository.create.mockReturnValue({ id: 'message-1' });
            chatRepository.save.mockResolvedValue({ id: 'message-1' });
            chatRepository.findOneOrFail.mockResolvedValue({ id: 'message-1', sender: { id: 'sender-1' } });

            const result = await service.sendMessage(
                'article-1',
                { content: 'hello', receiverId: ' receiver-1 ' } as any,
                { user: { sub: 'sender-1', email: 'e', preferred_username: 'u' } } as any,
            );

            expect(usersService.findOrCreate).toHaveBeenCalled();
            expect(usersService.findOne).toHaveBeenCalledWith('receiver-1');
            expect(chatRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    articleId: 'article-1',
                    senderId: 'sender-1',
                    receiverId: 'receiver-1',
                    content: 'hello',
                }),
            );
            expect(chatRepository.save).toHaveBeenCalled();
            expect(result).toEqual({ id: 'message-1', sender: { id: 'sender-1' } });
        });

        it('should infer receiverId as sellerId when senderId !== sellerId', async () => {
            usersService.findOrCreate.mockResolvedValue({ id: 'buyer-1' });
            articleRepository.findOne.mockResolvedValue({ id: 'article-1', sellerId: 'seller-1' });
            usersService.findOne.mockResolvedValue({ id: 'seller-1' });
            chatRepository.create.mockReturnValue({ id: 'message-1' });
            chatRepository.save.mockResolvedValue({ id: 'message-1' });
            chatRepository.findOneOrFail.mockResolvedValue({ id: 'message-1' });

            const result = await service.sendMessage(
                'article-1',
                { content: 'hello' } as any,
                { user: { sub: 'buyer-1', email: 'e', preferred_username: 'u' } } as any,
            );

            expect(transactionRepository.findOne).not.toHaveBeenCalled();
            expect(usersService.findOne).toHaveBeenCalledWith('seller-1');
            expect(result).toEqual({ id: 'message-1' });
        });

        it('should infer receiverId from transaction buyerId when senderId === sellerId', async () => {
            usersService.findOrCreate.mockResolvedValue({ id: 'seller-1' });
            articleRepository.findOne.mockResolvedValue({ id: 'article-1', sellerId: 'seller-1' });
            transactionRepository.findOne.mockResolvedValue({ buyerId: 'buyer-1' });
            usersService.findOne.mockResolvedValue({ id: 'buyer-1' });
            chatRepository.create.mockReturnValue({ id: 'message-1' });
            chatRepository.save.mockResolvedValue({ id: 'message-1' });
            chatRepository.findOneOrFail.mockResolvedValue({ id: 'message-1' });

            await service.sendMessage(
                'article-1',
                { content: 'hello' } as any,
                { user: { sub: 'seller-1', email: 'e', preferred_username: 'u' } } as any,
            );

            expect(transactionRepository.findOne).toHaveBeenCalled();
            expect(chatRepository.findOne).not.toHaveBeenCalled();
            expect(usersService.findOne).toHaveBeenCalledWith('buyer-1');
        });

        it('should infer receiverId from last chat message receiverId fallback', async () => {
            usersService.findOrCreate.mockResolvedValue({ id: 'seller-1' });
            articleRepository.findOne.mockResolvedValue({ id: 'article-1', sellerId: 'seller-1' });
            transactionRepository.findOne.mockResolvedValue(null);
            chatRepository.findOne.mockResolvedValue({
                articleId: 'article-1',
                senderId: 'seller-1',
                receiverId: 'buyer-1',
            });
            usersService.findOne.mockResolvedValue({ id: 'buyer-1' });
            chatRepository.create.mockReturnValue({ id: 'message-1' });
            chatRepository.save.mockResolvedValue({ id: 'message-1' });
            chatRepository.findOneOrFail.mockResolvedValue({ id: 'message-1' });

            await service.sendMessage(
                'article-1',
                { content: 'hello' } as any,
                { user: { sub: 'seller-1', email: 'e', preferred_username: 'u' } } as any,
            );

            expect(chatRepository.findOne).toHaveBeenCalled();
            expect(usersService.findOne).toHaveBeenCalledWith('buyer-1');
        });

        it('should throw BadRequestException when receiverId cannot be inferred', async () => {
            usersService.findOrCreate.mockResolvedValue({ id: 'seller-1' });
            articleRepository.findOne.mockResolvedValue({ id: 'article-1', sellerId: 'seller-1' });
            transactionRepository.findOne.mockResolvedValue(null);
            chatRepository.findOne.mockResolvedValue({
                articleId: 'article-1',
                senderId: 'seller-1',
                receiverId: undefined,
            });

            await expect(
                service.sendMessage(
                    'article-1',
                    { content: 'hello' } as any,
                    { user: { sub: 'seller-1', email: 'e', preferred_username: 'u' } } as any,
                ),
            ).rejects.toThrow(BadRequestException);
        });

        it('should infer receiverId from last chat message senderId when lastMessage.senderId !== senderId', async () => {
            usersService.findOrCreate.mockResolvedValue({ id: 'seller-1' });
            articleRepository.findOne.mockResolvedValue({ id: 'article-1', sellerId: 'seller-1' });
            transactionRepository.findOne.mockResolvedValue(null);
            chatRepository.findOne.mockResolvedValue({
                articleId: 'article-1',
                senderId: 'other-sender-1',
                receiverId: 'seller-1',
            });
            usersService.findOne.mockResolvedValue({ id: 'other-sender-1' });
            chatRepository.create.mockReturnValue({ id: 'message-1' });
            chatRepository.save.mockResolvedValue({ id: 'message-1' });
            chatRepository.findOneOrFail.mockResolvedValue({ id: 'message-1' });

            await service.sendMessage(
                'article-1',
                { content: 'hello' } as any,
                { user: { sub: 'seller-1', email: 'e', preferred_username: 'u' } } as any,
            );

            expect(usersService.findOne).toHaveBeenCalledWith('other-sender-1');
        });
    });
});

describe('ChatController', () => {
    it('should delegate getMessages and sendMessage to ChatService', async () => {
        const chatService = {
            getMessages: jest.fn().mockResolvedValue([]),
            sendMessage: jest.fn().mockResolvedValue({ id: 'm1' }),
        };

        const controller = new ChatController(chatService as any);

        await expect(controller.getMessages('article-1')).resolves.toEqual([]);
        expect(chatService.getMessages).toHaveBeenCalledWith('article-1');

        await expect(
            controller.sendMessage('article-1', { content: 'hello' } as any, { user: { sub: 'u1' } } as any),
        ).resolves.toEqual({ id: 'm1' });
        expect(chatService.sendMessage).toHaveBeenCalledWith(
            'article-1',
            { content: 'hello' },
            { user: { sub: 'u1' } },
        );
    });
});

