import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Article } from '../articles/article.entity';

@Entity('price_history')
export class PriceHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Article, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'article_id' })
    article: Article;

    @Column({ name: 'article_id' })
    articleId: string;

    @Column('decimal', { precision: 10, scale: 2, name: 'old_price' })
    oldPrice: number;

    @Column('decimal', { precision: 10, scale: 2, name: 'new_price' })
    newPrice: number;

    @CreateDateColumn({ name: 'changed_at' })
    changedAt: Date;
}
