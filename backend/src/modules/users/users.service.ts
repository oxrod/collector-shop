import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
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

    async findOrCreate(keycloakId: string, email: string, username: string): Promise<User> {
        let user = await this.findByKeycloakId(keycloakId);
        if (!user) {
            user = this.userRepository.create({
                keycloakId,
                email,
                username,
                role: 'buyer',
            });
            user = await this.userRepository.save(user);
        }
        return user;
    }

    async updateRole(id: string, role: 'buyer' | 'seller' | 'admin'): Promise<User> {
        const user = await this.findOne(id);
        user.role = role;
        return this.userRepository.save(user);
    }
}
