import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ACCESS_CONTROL_KEY } from '../constants/guard.constants';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  applyDecorators(
    SetMetadata(PERMISSIONS_KEY, permissions),
    SetMetadata(ACCESS_CONTROL_KEY, { permissions }),
  );
