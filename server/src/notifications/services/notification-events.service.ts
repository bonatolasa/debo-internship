import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import {
  NotificationEventName,
  NotificationEventPayload,
} from '../events/notification-events';

@Injectable()
export class NotificationEventsService {
  private readonly emitter = new EventEmitter();

  emit(event: NotificationEventName, payload: NotificationEventPayload) {
    this.emitter.emit(event, payload);
  }

  on(event: NotificationEventName, listener: (payload: NotificationEventPayload) => void) {
    this.emitter.on(event, listener);
  }
}
