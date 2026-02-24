import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Article } from '../articles/article.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, name: 'keycloak_id' })
    keycloakId: string;

    @Column({ unique: true })
    email: string;

    @Column({ length: 100 })
    username: string;

    @Column({ length: 100, nullable: true, name: 'first_name' })
    firstName: string;

    @Column({ length: 100, nullable: true, name: 'last_name' })
    lastName: string;

    @Column({
        type: 'varchar',
        length: 20,
        default: 'buyer',
    })
    role: 'buyer' | 'seller' | 'admin';

    @Column({ default: true, name: 'is_active' })
    isActive: boolean;

    @OneToMany(() => Article, (article) => article.seller)
    articles: Article[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
