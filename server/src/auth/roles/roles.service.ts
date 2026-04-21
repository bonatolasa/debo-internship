import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoleDocument } from './roles.schema';
import { ROLE_PERMISSIONS, Permissions } from '../constants/permissions.constants';
import { normalizeRoles } from '../utils/role.utils';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class RolesService implements OnModuleInit {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectModel(RoleDocument.name)
    private readonly roleModel: Model<RoleDocument>,
  ) { }

  async onModuleInit() {
    await Promise.all(
      Object.entries(ROLE_PERMISSIONS).map(async ([role, permissions]) => {
        await this.roleModel.findOneAndUpdate(
          { name: role },
          { name: role, permissions: Array.from(new Set(permissions)) },
          { upsert: true, new: true },
        );
      }),
    );
    this.logger.log('Default roles and permissions ensured');
  }

  async getPermissionsForRoles(roleNames: Array<string | Role>): Promise<string[]> {
    const normalized = normalizeRoles(roleNames);
    if (!normalized.length) {
      return [];
    }

    const roleDocs = await this.roleModel.find({ name: { $in: normalized } }).exec();
    const permissionSet = new Set<string>();
    roleDocs.forEach((roleDoc) => {
      roleDoc.permissions.forEach((permission) => permissionSet.add(permission));
    });

    return Array.from(permissionSet);
  }

  async getByName(roleName: string): Promise<RoleDocument | null> {
    return this.roleModel.findOne({ name: roleName.toLowerCase() }).exec();
  }

  async getAllRoles(): Promise<RoleDocument[]> {
    return this.roleModel.find().sort({ name: 1 }).exec();
  }

  async createRole(name: string, description?: string): Promise<RoleDocument> {
    const normalized = this.normalizeName(name);
    const existing = await this.getByName(normalized);
    if (existing) {
      throw new BadRequestException(`Role "${normalized}" already exists`);
    }
    return this.roleModel.create({
      name: normalized,
      description,
      permissions: [],
    });
  }

  async renameRole(oldName: string, newName: string): Promise<RoleDocument> {
    const normalizedOld = this.normalizeName(oldName);
    const normalizedNew = this.normalizeName(newName);

    if (normalizedOld === Role.SUPER_ADMIN) {
      throw new BadRequestException('SUPER_ADMIN role cannot be renamed');
    }

    const oldRole = await this.getByName(normalizedOld);
    if (!oldRole) {
      throw new NotFoundException(`Role "${normalizedOld}" not found`);
    }

    const targetExists = await this.getByName(normalizedNew);
    if (targetExists) {
      throw new BadRequestException(`Role "${normalizedNew}" already exists`);
    }

    oldRole.name = normalizedNew;
    return oldRole.save();
  }

  async deleteRole(name: string): Promise<void> {
    const normalized = this.normalizeName(name);
    if (normalized === Role.SUPER_ADMIN) {
      throw new BadRequestException('SUPER_ADMIN role cannot be deleted');
    }
    const result = await this.roleModel.deleteOne({ name: normalized }).exec();
    if (!result.deletedCount) {
      throw new NotFoundException(`Role "${normalized}" not found`);
    }
  }

  async addPermissions(name: string, permissions: string[]): Promise<RoleDocument> {
    const role = await this.getExistingRole(name);
    const normalized = this.normalizePermissions(permissions);

    const merged = new Set([...(role.permissions || []), ...normalized]);
    role.permissions = Array.from(merged);

    return role.save();
  }

  async removePermissions(
    name: string,
    permissions: string[],
  ): Promise<RoleDocument> {
    const role = await this.getExistingRole(name);
    const normalized = this.normalizePermissions(permissions);

    const removeSet = new Set(normalized);
    role.permissions = (role.permissions || []).filter((p) => !removeSet.has(p));
    return role.save();
  }

  private normalizePermissions(permissions: string[]): string[] {
    const permissionMap = Permissions as Record<string, string>;
    const validPermissions = Object.values(Permissions) as string[];

    const normalized = permissions.map((p) => {
      // Convert CONSTANT → value (USERS_CREATE → users.create)
      if (permissionMap[p]) return permissionMap[p];

      // Normalize lowercase input
      return p.toLowerCase().trim();
    });

    // Filter only valid permissions
    return normalized.filter((p) => validPermissions.includes(p));
  }

  private async getExistingRole(name: string): Promise<RoleDocument> {
    const normalized = this.normalizeName(name);
    const role = await this.getByName(normalized);
    if (!role) {
      throw new NotFoundException(`Role "${normalized}" not found`);
    }
    return role;
  }

  private normalizeName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, '_');
  }
}
