import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/tasks.schema';
import { TasksController } from './controllers/tasks.controller';
import { TasksService } from './services/tasks.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ProjectsModule } from '../projects/projects.module';
import { Project, ProjectSchema } from 'src/projects/schemas/project.schema';
import { User, UserSchema } from 'src/users/schemas/users.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: User.name, schema: UserSchema },
    ]),
    NotificationsModule,
    ProjectsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
