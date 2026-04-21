import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleDocument, RoleSchema } from './roles.schema';
import { User, UserSchema } from '../../users/schemas/users.schemas';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Team, TeamSchema } from 'src/teams/schemas/team.schema';
import { Project, ProjectSchema } from 'src/projects/schemas/project.schema';
import { Task, TaskSchema } from 'src/tasks/schemas/tasks.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoleDocument.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
      { name: Team.name, schema: TeamSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
  ],
  controllers: [RolesController],
  providers: [RolesService, PermissionsGuard],
  exports: [RolesService, PermissionsGuard],
})
export class RolesModule {}
