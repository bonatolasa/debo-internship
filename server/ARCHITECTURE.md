# Hybrid Access Control Backend (NestJS + MongoDB)

## 1. Full System Architecture
- Authentication: JWT login/register with bcrypt hashing.
- Authorization: `@authorize({ roles, permissions, context })` using hybrid checks.
- Access layers:
  - Role-based (`SUPER_ADMIN` and `ADMIN` elevated).
  - Permission-based (`module.action`).
  - Context-based (`team_member`, `project_member`, `task_access`).
- Domain modules: auth, users, roles, permissions, teams, projects, tasks, comments, attachments, notifications, reports.
- Event-driven notifications with internal event bus and listeners.

## 2. MongoDB Schema Design
- `users`: profile, password hash, `roles[]`, `team`, activation.
- `roles`: dynamic role name, `permissions[]`, description.
- `permissions`: dynamic permission name, description.
- `teams`: name, description, manager(optional), members[].
- `projects`: name, description, team, `createdBy`, status, timeline.
- `tasks`: title, description, project, `assignedTo` (single user), `createdBy`, QA/status fields.
- `comments`: taskId, userId, message, parentCommentId.
- `attachments`: taskId, uploadedBy, file metadata.
- `notifications`: userId, title, message, type, relatedId, readStatus.
- `reports`: computed from live collections.

## 3. NestJS Folder Structure
- `src/auth/*` authentication, guards, decorators.
- `src/permissions/*` DB permission module.
- `src/users/*`, `src/roles/*`, `src/teams/*`, `src/projects/*`, `src/tasks/*`.
- `src/comments/*`, `src/attachments/*`, `src/notifications/*`, `src/reports/*`.
- `src/enums/*` role/status/priority.

## 4. Hybrid RBAC Implementation
- Decorator: `@authorize({ roles, permissions, context })`.
- Guard flow:
  - JWT identity load.
  - Elevated-role bypass (`SUPER_ADMIN`, `ADMIN`).
  - Role check.
  - Permission check.
  - Context check by team/project/task relationship.

## 5. Role + Permission System (Multi-Role)
- User stores `roles[]`.
- Role names are dynamic (DB-backed).
- Roles API supports create, rename, delete, assign permissions, remove permissions, list/detail.
- `SUPER_ADMIN` role is protected from rename/delete.
- Permissions are also DB-backed and list/create endpoints are available.

## 6. `@Authorize` Guard Logic
- Reads metadata keys from route/class.
- Supports:
  - `roles: Role[]`
  - `permissions: string[]`
  - `context: { check, ...id sources }`
- Context checks implemented:
  - `team_member` (must belong to target team).
  - `project_member` (must belong to project’s team).
  - `task_access` (assigned user or project creator/manager).

## 7. Event-Driven Notification System
- Events:
  - `project.created`
  - `task.created`
  - `task.assigned`
  - `task.updated`
  - `comment.created`
- Flow:
  1. Service emits via `NotificationEventsService`.
  2. Listener receives in `NotificationListenerService`.
  3. Notification records saved in DB via `NotificationsService`.
  4. Ready to extend with websocket push.

## 8. Module Implementations
- Auth: JWT strategy, login/register, `@CurrentUser`.
- Users: CRUD, activate/deactivate, multi-role assignment.
- Roles: dynamic role management + permission binding.
- Permissions: create/list permissions.
- Teams: create/add/remove members, member-scoped visibility.
- Projects: team-bound projects, `createdBy` as manager.
- Tasks: single-assignee tasks, team-bound assignee validation, tester QA-safe updates.
- Comments/Attachments: task-linked collaboration artifacts.
- Notifications: event-driven persistence.
- Reports: dashboard/team/project/user performance analytics.

## 9. SaaS Scaling Best Practices
- Keep auth stateless with JWT and refresh-token strategy.
- Use compound indexes for frequent filters (`team`, `project`, `assignedTo`, status/date).
- Split read-heavy analytics into background aggregation jobs.
- Add caching for dashboards and permission matrices.
- Emit domain events for async workflows (notification, audit, webhook).
- Add centralized audit logging and structured request tracing.
- Use API versioning and migration-safe DTO evolution.
