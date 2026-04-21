import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.log(`Required roles: ${JSON.stringify(requiredRoles)}`);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    this.logger.log(`User from request: ${JSON.stringify(user)}`);

    if (!user) {
      this.logger.warn('No user in request');
      return false;
    }

    const userRoles = user.roles || [];
    this.logger.log(`User roles: ${JSON.stringify(userRoles)}`);

    if (userRoles.length === 0) {
      this.logger.warn('User has no roles');
      return false;
    }

    const normalizedUserRoles = userRoles.map((r: string) => r.toLowerCase());
    const normalizedRequiredRoles = requiredRoles.map((r: Role) => r.toLowerCase());

    const hasRole = normalizedUserRoles.some((userRole: string) =>
      normalizedRequiredRoles.includes(userRole)
    );

    this.logger.log(`Has role: ${hasRole}`);

    return hasRole;
  }
}
