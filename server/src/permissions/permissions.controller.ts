import { Body, Controller, Get, Post } from '@nestjs/common';
import { authorize } from 'src/auth/decorators/authorize.decorator';
import { Permissions } from 'src/auth/constants/permissions.constants';
import { Role } from 'src/enums/role.enum';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  @authorize({
    roles: [Role.SUPER_ADMIN],
    permissions: [Permissions.PERMISSIONS_CREATE],
  })
  @Post()
  async create(@Body() body: { name: string; description?: string }) {
    return {
      success: true,
      data: await this.permissionsService.create(body.name, body.description),
      message: 'Permission created successfully',
    };
  }

  @authorize({
    roles: [Role.SUPER_ADMIN],
    permissions: [Permissions.PERMISSIONS_VIEW],
  })
  @Get()
  async list() {
    return {
      success: true,
      data: await this.permissionsService.list(),
      message: 'Permissions retrieved successfully',
    };
  }
}
