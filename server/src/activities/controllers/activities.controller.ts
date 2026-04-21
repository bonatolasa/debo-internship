import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { ActivitiesService } from '../services/activities.service';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) { }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @UseGuards(RolesGuard)
  @JwtAuthGuard()
  @Get()
  async findAll(@Query('actionType') actionType?: string) {
    const activities = await this.activitiesService.getAll(actionType);
    return {
      success: true,
      message: 'Activities fetched successfully',
      data: activities,
    };
  }
}
