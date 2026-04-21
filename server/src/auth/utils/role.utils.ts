import { Role } from 'src/enums/role.enum';

const ROLE_NORMALIZATION: Record<string, Role> = {
  super_admin: Role.SUPER_ADMIN,
  admin: Role.ADMIN,
  project_manager: Role.PROJECT_MANAGER,
  manager: Role.PROJECT_MANAGER,
  tester: Role.TESTER,
  team_member: Role.TEAM_MEMBER,
  member: Role.TEAM_MEMBER,
};

const ROLE_PRIORITY: Role[] = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.PROJECT_MANAGER,
  Role.TESTER,
  Role.TEAM_MEMBER,
];

export const normalizeRoleValue = (role?: string | Role): Role | undefined => {
  if (!role) return undefined;
  const normalizedKey = typeof role === 'string' ? role.toLowerCase() : role;
  return (
    ROLE_NORMALIZATION[normalizedKey] ??
    (Object.values(Role).includes(role as Role) ? (role as Role) : undefined)
  );
};

export const normalizeRoles = (roles?: Array<string | Role>): Role[] => {
  const normalized = new Set<Role>();
  (roles ?? []).forEach((role) => {
    const candidate = normalizeRoleValue(role);
    if (candidate) {
      normalized.add(candidate);
    }
  });
  return Array.from(normalized).sort((a, b) => ROLE_PRIORITY.indexOf(a) - ROLE_PRIORITY.indexOf(b));
};

export const getUserRoleSet = (user?: {
  role?: string;
  roles?: Array<string | Role>;
}) => {
  if (!user) {
    return new Set<Role>();
  }

  const normalizedInput: Array<string | Role> = [];
  if (user.roles) {
    normalizedInput.push(...user.roles);
  }
  if (user.role) {
    normalizedInput.push(user.role);
  }

  return new Set(normalizeRoles(normalizedInput));
};

export const userHasRole = (
  user?: { role?: string; roles?: Array<string | Role> },
  role?: Role,
) => {
  if (!user || !role) {
    return false;
  }

  const normalizedRole = normalizeRoleValue(role);
  if (!normalizedRole) {
    return false;
  }
  return getUserRoleSet(user).has(normalizedRole);
};
