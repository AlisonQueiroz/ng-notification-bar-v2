import { EventEmitter, Injectable } from '@angular/core';
import { Notification } from './notification-bar.models';

@Injectable({
  providedIn: 'root'
})
export class NotificationBarService {
  readonly onCreate = new EventEmitter<Notification>();
  readonly onClose = new EventEmitter<Notification>();

  create(notification: Notification) {
    this.onCreate.emit(notification);
  }

  close(notification: Notification) {
    this.onClose.emit(notification);
  }
}
