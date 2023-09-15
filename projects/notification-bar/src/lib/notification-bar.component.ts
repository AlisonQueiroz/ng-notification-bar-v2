import {
  Component, OnInit, Optional, Inject,
  InjectionToken, OnDestroy
} from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Notification, NotificationType } from './notification-bar.models';
import { Subject, takeUntil } from 'rxjs';
import { NotificationBarService } from './notification-bar.service';
import { MessagesConfig } from './message-config';

export const MESSAGES_CONFIG = new InjectionToken('notification-bar.messages.config');

@Component({
  selector: 'notification-bar',
  styles: [`
        :host {
          position: relative;
          display: block;
        }
        .notifications-container {
          position: fixed;
          top: 0px;
          right: 0;
          left: 0;
          line-height: 25px;
          width: 100%;
          z-index: 6;
          overflow: hidden;
        }
        .notification {
          position: relative;
          text-align: center;
          font-size: 12px;
          color: #fff;
        }
        .message {
          padding: 0 12px;
        }
        .error {
          background-color: #F64747;
          border-bottom: 1px solid #f31515;
        }
        .success {
          background-color: #03C9A9;
          border-bottom: 1px solid #02aa8f;
        }
        .warning {
          background-color: #F7CA18;
          border-bottom: 1px solid #e7ba08;
        }
        .info {
          background-color: #0c6997;
          border-bottom: 1px solid #0c6997;
        }
        .close-click {
          font-size: 22px;
          cursor: pointer;
          padding: 10px;
          position: relative;
          top: 2px;
          margin: 0 auto;
        }
    `],
  template: `
        <div class="notifications-container">
            <div *ngFor="let notification of notifications; let i = index;"
                 class="notification {{notification.typeValue}}"
                 (mouseover)="hideOnHover(notification)"
                 [@flyDown]>
                <span *ngIf="notification.isHtml" class="message" [innerHTML]="notification.message"></span>
                <span *ngIf="!notification.isHtml" class="message">{{notification.message}}</span>
                <span class="close-click" *ngIf="notification.allowClose" (click)="hideNotification(notification)">×</span>
            </div>
        </div>
    `,
  animations: [
    trigger('flyDown', [
      state('in', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateY(-100%)'
        }),
        animate('600ms ease-in')
      ]),
      transition('* => void', [
        animate('200ms ease-out', style({
          opacity: 0,
          transform: 'translateY(-100%)'
        }))
      ])
    ])
  ]
})
export class NotificationBarComponent implements OnDestroy {
  constructor(
    private readonly notificationBarService: NotificationBarService,
    @Inject(MESSAGES_CONFIG) @Optional() private readonly config?: MessagesConfig
  ) {
    this.notificationBarService.onCreate.pipe(
      takeUntil(this.destroy$)
    ).subscribe(x => this.addNotification(x));

    this.notificationBarService.onClose.pipe(
      takeUntil(this.destroy$)
    ).subscribe(x => this.hideNotification(x));
  }

  readonly notifications: Notification[] = [];

  private readonly defaults = {
    message: '',
    type: NotificationType.Info,
    autoHide: true,
    hideDelay: 3000,
    isHtml: false,
    allowClose: false,
    hideOnHover: true
  };

  private readonly destroy$ = new Subject<void>();

  addNotification(notification: Notification) {
    const newNotification = Object.assign({}, this.defaults, notification);
    newNotification.typeValue = NotificationType[newNotification.type].toLowerCase();
    if (this.config && this.config.messages) {
      newNotification.message = this.config.messages[notification.message] || notification.message;
    }

    this.notifications.push(newNotification);

    if (newNotification.autoHide) {
      window.setTimeout(() => {
        this.hideNotification(newNotification);
      }, newNotification.hideDelay);
    }
  }

  hideNotification(notification: Notification) {
    const index = this.notifications.indexOf(notification);

    this.notifications.splice(index, 1);
  }

  hideOnHover(notification: Notification) {
    if (notification.hideOnHover) {
      this.hideNotification(notification);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
