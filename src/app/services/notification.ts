'use strict';

import { Injectable } from '@angular/core';
import { FlutterService } from './flutter';
import { LocalNotifications } from '@ionic-native/local-notifications';

@Injectable()
export class NotificationService {

  private static NOTIFICATION_ID: 1234;

  private flutter: FlutterService;
  private notification: LocalNotifications;

  constructor(flutter: FlutterService, notification: LocalNotifications) {
    this.flutter = flutter;
    this.notification = notification;
  }

  public init(): Promise<void> {
    return this.getPermission()
      .then(() => this.notify(this.flutter.profit))
      .then(() => this.flutter.profitUpdate.subscribe(profit => this.notify(profit)))
      .catch(error => {
        if (error === 'cordova_not_available') {
          console.warn('Notifications not available in browser');
          return;
        }
        console.error('an error occurred registering notifications');
        console.error(error);
      });
  }

  private getPermission(): Promise<boolean> {
    return this.notification.hasPermission()
      .then(permission => {
        if (permission) {
          return Promise.resolve(true);
        }
        return this.notification.registerPermission();
      })
  }

  private notify(profit: string): Promise<void> {

    let fn: Function = null;
    return this.notification.isPresent(NotificationService.NOTIFICATION_ID)
      .then(present => {
        fn = present ? this.notification.update : this.notification.schedule;
        return fn({
          id: NotificationService.NOTIFICATION_ID,
          title: 'FlutterBot Profit',
          text: profit,
          sticky: true,
        });
      })
  }
}
