import {
    Controller,
    Get,
    Patch,
    Param,
    UseGuards,
    Request,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Lister mes notifications' })
    @ApiResponse({ status: 200, description: 'Liste des notifications' })
    findAll(@Request() req: any) {
        return this.notificationsService.findByUser(req.user.sub);
    }

    @Get('unread')
    @ApiOperation({ summary: 'Notifications non lues' })
    findUnread(@Request() req: any) {
        return this.notificationsService.findUnreadByUser(req.user.sub);
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Marquer une notification comme lue' })
    markAsRead(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        return this.notificationsService.markAsRead(id, req.user.sub);
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
    markAllAsRead(@Request() req: any) {
        return this.notificationsService.markAllAsRead(req.user.sub);
    }
}
