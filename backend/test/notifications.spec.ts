import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from '../src/modules/notifications/notifications.service';
import { NotificationsController } from '../src/modules/notifications/notifications.controller';
import { Notification } from '../src/modules/notifications/notification.entity';

const mockNotificationRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
};

describe('NotificationsService', () => {
    let service: NotificationsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsService,
                {
                    provide: getRepositoryToken(Notification),
                    useValue: mockNotificationRepository,
                },
            ],
        }).compile();

        service = module.get<NotificationsService>(NotificationsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create and return a notification', async () => {
            const created = {
                id: '1',
                userId: 'u1',
                type: 'info',
                title: 'Test',
                message: 'Test message',
            };
            mockNotificationRepository.create.mockReturnValue({
                userId: 'u1',
                type: 'info',
                title: 'Test',
                message: 'Test message',
            });
            mockNotificationRepository.save.mockResolvedValue(created);

            const result = await service.create(
                'u1',
                'info',
                'Test',
                'Test message',
            );
            expect(result).toEqual(created);
            expect(mockNotificationRepository.create).toHaveBeenCalledWith({
                userId: 'u1',
                type: 'info',
                title: 'Test',
                message: 'Test message',
            });
            expect(mockNotificationRepository.save).toHaveBeenCalled();
        });
    });

    describe('findByUser', () => {
        it('should return notifications for user ordered by createdAt DESC', async () => {
            const notifications = [
                { id: '1', userId: 'u1', title: 'N1', isRead: false },
                { id: '2', userId: 'u1', title: 'N2', isRead: true },
            ];
            mockNotificationRepository.find.mockResolvedValue(notifications);

            const result = await service.findByUser('u1');
            expect(result).toEqual(notifications);
            expect(mockNotificationRepository.find).toHaveBeenCalledWith({
                where: { userId: 'u1' },
                order: { createdAt: 'DESC' },
            });
        });
    });

    describe('findUnreadByUser', () => {
        it('should return unread notifications for user', async () => {
            const notifications = [
                { id: '1', userId: 'u1', title: 'N1', isRead: false },
            ];
            mockNotificationRepository.find.mockResolvedValue(notifications);

            const result = await service.findUnreadByUser('u1');
            expect(result).toEqual(notifications);
            expect(mockNotificationRepository.find).toHaveBeenCalledWith({
                where: { userId: 'u1', isRead: false },
                order: { createdAt: 'DESC' },
            });
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read and return it', async () => {
            const notification = {
                id: '1',
                userId: 'u1',
                title: 'Test',
                isRead: false,
            };
            const updated = { ...notification, isRead: true };
            mockNotificationRepository.findOne.mockResolvedValue(notification);
            mockNotificationRepository.save.mockResolvedValue(updated);

            const result = await service.markAsRead('1', 'u1');
            expect(result).toEqual(updated);
            expect(notification.isRead).toBe(true);
            expect(mockNotificationRepository.findOne).toHaveBeenCalledWith({
                where: { id: '1', userId: 'u1' },
            });
            expect(mockNotificationRepository.save).toHaveBeenCalledWith(
                notification,
            );
        });

        it('should throw NotFoundException if notification not found', async () => {
            mockNotificationRepository.findOne.mockResolvedValue(null);
            await expect(service.markAsRead('non-existent', 'u1')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('markAllAsRead', () => {
        it('should update all unread notifications for user', async () => {
            mockNotificationRepository.update.mockResolvedValue({ affected: 3 });

            await service.markAllAsRead('u1');
            expect(mockNotificationRepository.update).toHaveBeenCalledWith(
                { userId: 'u1', isRead: false },
                { isRead: true },
            );
        });
    });
});

describe('NotificationsController', () => {
    let controller: NotificationsController;
    let notificationsService: {
        findByUser: jest.Mock;
        findUnreadByUser: jest.Mock;
        markAsRead: jest.Mock;
        markAllAsRead: jest.Mock;
    };

    beforeEach(async () => {
        notificationsService = {
            findByUser: jest.fn(),
            findUnreadByUser: jest.fn(),
            markAsRead: jest.fn(),
            markAllAsRead: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotificationsController],
            providers: [
                {
                    provide: NotificationsService,
                    useValue: notificationsService,
                },
            ],
        }).compile();

        controller = module.get<NotificationsController>(NotificationsController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should delegate to notificationsService.findByUser with req.user.sub', async () => {
            const req = { user: { sub: 'kc-123' } };
            const notifications = [
                { id: '1', userId: 'kc-123', title: 'N1', isRead: false },
            ];
            notificationsService.findByUser.mockResolvedValue(notifications);

            const result = await controller.findAll(req);
            expect(result).toEqual(notifications);
            expect(notificationsService.findByUser).toHaveBeenCalledWith(
                'kc-123',
            );
        });
    });

    describe('findUnread', () => {
        it('should delegate to notificationsService.findUnreadByUser with req.user.sub', async () => {
            const req = { user: { sub: 'kc-123' } };
            const notifications = [
                { id: '1', userId: 'kc-123', title: 'N1', isRead: false },
            ];
            notificationsService.findUnreadByUser.mockResolvedValue(notifications);

            const result = await controller.findUnread(req);
            expect(result).toEqual(notifications);
            expect(notificationsService.findUnreadByUser).toHaveBeenCalledWith(
                'kc-123',
            );
        });
    });

    describe('markAsRead', () => {
        it('should delegate to notificationsService.markAsRead with id and req.user.sub', async () => {
            const req = { user: { sub: 'kc-123' } };
            const notification = {
                id: '1',
                userId: 'kc-123',
                title: 'N1',
                isRead: true,
            };
            notificationsService.markAsRead.mockResolvedValue(notification);

            const result = await controller.markAsRead('1', req);
            expect(result).toEqual(notification);
            expect(notificationsService.markAsRead).toHaveBeenCalledWith(
                '1',
                'kc-123',
            );
        });
    });

    describe('markAllAsRead', () => {
        it('should delegate to notificationsService.markAllAsRead with req.user.sub', async () => {
            const req = { user: { sub: 'kc-123' } };
            notificationsService.markAllAsRead.mockResolvedValue(undefined);

            await controller.markAllAsRead(req);
            expect(notificationsService.markAllAsRead).toHaveBeenCalledWith(
                'kc-123',
            );
        });
    });
});
