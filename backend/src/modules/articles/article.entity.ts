import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Shop } from '../shops/shop.entity';
import { Category } from '../categories/category.entity';

@Entity('articles')
export class Article {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    title: string;

    @Column('text')
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0, name: 'shipping_cost' })
    shippingCost: number;

    @Column('jsonb', { default: '[]', name: 'photo_urls' })
    photoUrls: string[];

    @Column({
        type: 'varchar',
        length: 30,
        default: 'Bon état',
    })
    condition: 'Neuf' | 'Très bon état' | 'Bon état' | 'Correct';

    @Column({
        type: 'varchar',
        length: 20,
        default: 'pending',
    })
    status: 'pending' | 'validated' | 'rejected' | 'sold';

    @Column('decimal', { precision: 5, scale: 2, default: 0, name: 'fraud_score' })
    fraudScore: number;

    @ManyToOne(() => User, (user) => user.articles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'seller_id' })
    seller: User;

    @Column({ name: 'seller_id' })
    sellerId: string;

    @ManyToOne(() => Shop, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'shop_id' })
    shop: Shop;

    @Column({ name: 'shop_id', nullable: true })
    shopId: string;

    @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @Column({ name: 'category_id', nullable: true })
    categoryId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
