import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    async create(userId: string, type: string, title: string, message: string): Promise<Notification> {
        const notification = this.notificationRepository.create({
            userId,
            type,
            title,
            message,
        });
        return this.notificationRepository.save(notification);
    }

    async findByUser(userId: string): Promise<Notification[]> {
        return this.notificationRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async findUnreadByUser(userId: string): Promise<Notification[]> {
        return this.notificationRepository.find({
            where: { userId, isRead: false },
            order: { createdAt: 'DESC' },
        });
    }

    async markAsRead(id: string, userId: string): Promise<Notification> {
        const notification = await this.notificationRepository.findOne({
            where: { id, userId },
        });
        if (!notification) {
            throw new NotFoundException(`Notification ${id} introuvable`);
        }
        notification.isRead = true;
        return this.notificationRepository.save(notification);
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepository.update(
            { userId, isRead: false },
            { isRead: true },
        );
    }
}
