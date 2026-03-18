import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get(':articleId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lister les messages d’une discussion (article)' })
    getMessages(
        @Param('articleId', ParseUUIDPipe) articleId: string,
    ) {
        return this.chatService.getMessages(articleId);
    }

    @Post(':articleId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Envoyer un message à propos d’un article' })
    sendMessage(
        @Param('articleId', ParseUUIDPipe) articleId: string,
        @Body() dto: CreateChatMessageDto,
        @Request() req: any,
    ) {
        return this.chatService.sendMessage(articleId, dto, req);
    }
}

