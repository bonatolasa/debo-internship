import { Controller, Delete, Get, Param, Post, Body } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CommentsService } from '../services/comments.service';
import { CreateCommentDto } from '../dtos/comments.dto';
import { authorize } from 'src/auth/decorators/authorize.decorator';
import { Permissions } from 'src/auth/constants/permissions.constants';
import { Role } from 'src/enums/role.enum';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @authorize({
    permissions: [Permissions.COMMENTS_CREATE],
    roles: [Role.TEAM_MEMBER, Role.TESTER, Role.PROJECT_MANAGER],
  })
  @Post('tasks/:id/comments')
  async create(
    @Param('id') taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: { id: string; role?: string },
  ) {
    const data = await this.commentsService.create(taskId, user, dto);
    return {
      success: true,
      message: 'Comment added successfully',
      data,
    };
  }

  @authorize({
    permissions: [Permissions.COMMENTS_VIEW],
    roles: [Role.TEAM_MEMBER, Role.TESTER, Role.PROJECT_MANAGER],
  })
  @Get('tasks/:id/comments')
  async getByTask(@Param('id') taskId: string) {
    const data = await this.commentsService.getByTask(taskId);
    return {
      success: true,
      message: 'Comments fetched successfully',
      data,
    };
  }

  @authorize({
    permissions: [Permissions.COMMENTS_DELETE],
    roles: [Role.TEAM_MEMBER, Role.TESTER, Role.PROJECT_MANAGER],
  })
  @Delete('comments/:id')
  async remove(
    @Param('id') commentId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    await this.commentsService.remove(commentId, user);
    return {
      success: true,
      message: 'Comment deleted successfully',
      data: null,
    };
  }
}
