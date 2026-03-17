import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { ArticlesModule } from './modules/articles/articles.module';
import { UsersModule } from './modules/users/users.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ShopsModule } from './modules/shops/shops.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST', 'localhost'),
                port: configService.get<number>('DB_PORT', 5432),
                username: configService.get('DB_USERNAME', 'marketplace'),
                password: configService.get('DB_PASSWORD', 'marketplace_secret'),
                database: configService.get('DB_DATABASE', 'marketplace'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: configService.get('NODE_ENV') !== 'production',
            }),
            inject: [ConfigService],
        }),
        TerminusModule,
        AuthModule,
        UsersModule,
        ArticlesModule,
        PaymentsModule,
        CategoriesModule,
        ShopsModule,
        ReviewsModule,
        NotificationsModule,
        HealthModule,
        MetricsModule,
    ],
})
export class AppModule { }

