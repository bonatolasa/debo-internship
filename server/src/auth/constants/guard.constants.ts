import { Role } from 'src/enums/role.enum';

export const PERMISSIONS_KEY = 'permissions';
export const ACCESS_CONTROL_KEY = 'access_control';

export type AccessControlContext = {
  check?: 'team_member' | 'project_member' | 'task_access';
  teamIdParam?: string;
  projectIdParam?: string;
  taskIdParam?: string;
  projectIdBodyField?: string;
};

export type AccessControlMetadata = {
  roles?: Role[];
  permissions?: string[];
  elevatedRoles?: Role[];
  context?: AccessControlContext;
  requireAll?: boolean;
};

export const DEFAULT_ELEVATED_ROLES: Role[] = [Role.SUPER_ADMIN, Role.ADMIN];
