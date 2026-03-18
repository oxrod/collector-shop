import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserInterest } from './user-interest.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserInterest)
        private readonly userInterestRepository: Repository<UserInterest>,
    ) { }

    async findAll(): Promise<User[]> {
        return this.userRepository.find({ order: { createdAt: 'DESC' } });
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User ${id} not found`);
        }
        return user;
    }

    async findByKeycloakId(keycloakId: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { keycloakId } });
    }

    async findOrCreate(
        keycloakId: string,
        email: string,
        username: string,
        kcRoles?: ('admin' | 'seller' | 'buyer')[],
    ): Promise<User> {
        let user = await this.findByKeycloakId(keycloakId);

        if (!user) {
            user = await this.userRepository.findOne({ where: { email } });
            if (user) {
                user.keycloakId = keycloakId;
                user = await this.userRepository.save(user);
            }
        }

        if (!user) {
            user = this.userRepository.create({
                keycloakId,
                email,
                username,
                role: 'admin',
            });
            user = await this.userRepository.save(user);
        }

        if (kcRoles && kcRoles.length > 0) {
            const bestRole = kcRoles.includes('admin')
                ? 'admin'
                : kcRoles.includes('seller')
                    ? 'seller'
                    : 'buyer';
            if (user.role !== bestRole) {
                user.role = bestRole;
                user = await this.userRepository.save(user);
            }
        }

        return user;
    }

    async updateRole(id: string, role: 'buyer' | 'seller' | 'admin'): Promise<User> {
        const user = await this.findOne(id);
        user.role = role;
        return this.userRepository.save(user);
    }

    // --- Centres d'intérêt ---

    async getInterests(userId: string): Promise<UserInterest[]> {
        return this.userInterestRepository.find({
            where: { userId },
            relations: ['category'],
        });
    }

    async addInterest(userId: string, categoryId: string): Promise<UserInterest> {
        const existing = await this.userInterestRepository.findOne({
            where: { userId, categoryId },
        });
        if (existing) {
            return existing;
        }
        const interest = this.userInterestRepository.create({ userId, categoryId });
        return this.userInterestRepository.save(interest);
    }

    async removeInterest(userId: string, categoryId: string): Promise<void> {
        await this.userInterestRepository.delete({ userId, categoryId });
    }
}

