import { Injectable } from '@angular/core';
import { Notification } from './notification-bar.models';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationBarService {
  readonly onCreate = new Subject<Notification>();
  readonly onClose = new Subject<Notification>();

  create(notification: Notification) {
    this.onCreate.next(notification);
  }

  close(notification: Notification) {
    this.onClose.next(notification);
  }
}
