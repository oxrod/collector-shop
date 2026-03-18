import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateChatMessageDto {
    @ApiPropertyOptional({
        description: 'ID de l’utilisateur destinataire (optionnel).',
        example: 'b3d1f6e8-7c0d-4d2f-9b6d-6bbd5a7ddf18',
    })
    @IsOptional()
    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsUUID()
    receiverId?: string;

    @ApiProperty({
        description: 'Contenu du message',
        example: 'Bonjour !',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    content: string;
}

