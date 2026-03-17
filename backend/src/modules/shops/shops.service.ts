import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './shop.entity';

@Injectable()
export class ShopsService {
    constructor(
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
    ) { }

    async findAll(): Promise<Shop[]> {
        return this.shopRepository.find({
            relations: ['owner'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Shop> {
        const shop = await this.shopRepository.findOne({
            where: { id },
            relations: ['owner'],
        });
        if (!shop) {
            throw new NotFoundException(`Boutique ${id} introuvable`);
        }
        return shop;
    }

    async findByOwner(ownerId: string): Promise<Shop[]> {
        return this.shopRepository.find({
            where: { ownerId },
            order: { createdAt: 'DESC' },
        });
    }

    async create(name: string, description: string, ownerId: string): Promise<Shop> {
        const shop = this.shopRepository.create({ name, description, ownerId });
        return this.shopRepository.save(shop);
    }

    async update(id: string, name: string, description: string, ownerId: string): Promise<Shop> {
        const shop = await this.findOne(id);
        if (shop.ownerId !== ownerId) {
            throw new ForbiddenException('Vous ne pouvez modifier que vos propres boutiques');
        }
        shop.name = name ?? shop.name;
        shop.description = description ?? shop.description;
        return this.shopRepository.save(shop);
    }

    async remove(id: string, ownerId: string): Promise<void> {
        const shop = await this.findOne(id);
        if (shop.ownerId !== ownerId) {
            throw new ForbiddenException('Vous ne pouvez supprimer que vos propres boutiques');
        }
        await this.shopRepository.remove(shop);
    }
}
