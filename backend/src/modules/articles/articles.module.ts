import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { PriceHistory } from './price-history.entity';
import { UserInterest } from '../users/user-interest.entity';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Article, PriceHistory, UserInterest])],
    controllers: [ArticlesController],
    providers: [ArticlesService],
    exports: [ArticlesService],
})
export class ArticlesModule { }

