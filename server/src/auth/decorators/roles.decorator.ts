import { applyDecorators, SetMetadata } from '@nestjs/common';
import { Role } from '../../enums/role.enum';
import { ACCESS_CONTROL_KEY } from '../constants/guard.constants';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: [Role, ...Role[]]) =>
  applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    SetMetadata(ACCESS_CONTROL_KEY, { roles }),
  );
