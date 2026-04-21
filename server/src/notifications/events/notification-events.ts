export const NotificationEvents = {
  TASK_CREATED: 'task.created',
  TASK_ASSIGNED: 'task.assigned',
  TASK_UPDATED: 'task.updated',
  COMMENT_CREATED: 'comment.created',
  PROJECT_CREATED: 'project.created',
} as const;

export type NotificationEventName =
  (typeof NotificationEvents)[keyof typeof NotificationEvents];

export type NotificationEventPayload = {
  recipients: string[];
  title: string;
  message: string;
  type: string;
  relatedId?: string;
};
