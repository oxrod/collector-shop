import { IsString, IsNumber, IsOptional, IsNotEmpty, IsArray, IsIn, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArticleDto {
    @ApiProperty({ description: "Titre de l'article", example: 'Game Boy Color Pikachu' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @ApiProperty({ description: "Description de l'article (min 50 mots)", example: 'Console Game Boy Color édition spéciale Pikachu en très bon état...' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'Prix en euros', example: 89.99, minimum: 5 })
    @IsNumber()
    @Min(5)
    price: number;

    @ApiPropertyOptional({ description: 'Frais de port en euros', example: 6.50 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    shippingCost?: number;

    @ApiPropertyOptional({ description: "URLs des photos de l'article", type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    photoUrls?: string[];

    @ApiPropertyOptional({ description: "État de l'article", enum: ['Neuf', 'Très bon état', 'Bon état', 'Correct'] })
    @IsString()
    @IsIn(['Neuf', 'Très bon état', 'Bon état', 'Correct'])
    @IsOptional()
    condition?: string;

    @ApiPropertyOptional({ description: 'ID de la catégorie' })
    @IsString()
    @IsOptional()
    categoryId?: string;

    @ApiPropertyOptional({ description: 'ID de la boutique' })
    @IsString()
    @IsOptional()
    shopId?: string;
}

export class UpdateArticleDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(255)
    title?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @Min(5)
    @IsOptional()
    price?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @Min(0)
    @IsOptional()
    shippingCost?: number;

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    photoUrls?: string[];

    @ApiPropertyOptional({ enum: ['Neuf', 'Très bon état', 'Bon état', 'Correct'] })
    @IsString()
    @IsIn(['Neuf', 'Très bon état', 'Bon état', 'Correct'])
    @IsOptional()
    condition?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    categoryId?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    shopId?: string;
}
