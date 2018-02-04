'use strict';

import { Injectable } from '@angular/core';
import { FlutterService } from './flutter';

declare let cordova: any;

@Injectable()
export class NotificationService {

  public cordovaStub: any = { // testing
    schedule: (opts => console.log(opts)),
    clear: (opts => console.log(opts)),
    requestPermission: (opts => console.log(opts))
  };

  private static NOTIFICATION_ID: 1234;
  private static DOWN_ICON: string = 'file://assets/imgs/down.png' ;
  private static UNKNOWN_ICON: string = 'file://assets/imgs/unknown.png';
  private static UP_ICON: string = 'file://assets/imgs/up.png';

  private _enabled: boolean = true;
  private flutter: FlutterService;
  private plugin: any;

  constructor(flutter: FlutterService) {
    this.flutter = flutter;
  }

  public get enabled(): boolean {
    return this.hasCordova && this._enabled;
  }

  public set enabled(enabled: boolean) {
    if (this.enabled === enabled) {
      return;
    }

    this._enabled = enabled;

    // don't go further if there's no cordova
    if (!this.plugin) {
      return;
    }

    if (this.enabled) {
      this.notify(this.flutter.profit);
    } else {
      this.clear();
    }
  }

  public get hasCordova() {
    return !!this.plugin;
  }

  public init(): Promise<void> {

    this.plugin = NotificationService.getPlugin();

    if (!this.enabled) {
      console.warn('notifications disabled');
      return Promise.resolve(null);
    }

    return this.requestPermission()
      .then(() => {
        this.notify(this.flutter.profit);
        this.flutter.profitUpdate.subscribe(profit => this.enabled && this.notify(profit));
      })
      .catch(error => {
        console.error('an error occurred registering plugins');
        console.error(error);
      });
  }

  private clear(): void {
    this.plugin.clear(NotificationService.NOTIFICATION_ID);
  }

  private getIcon(): string {

    if (this.flutter.trend === null) {
      return NotificationService.UNKNOWN_ICON;
    }

    return this.flutter.trend ? NotificationService.UP_ICON : NotificationService.DOWN_ICON;
  }

  private static getPlugin(): any {
    if (typeof cordova === 'undefined') {
      // return this.cordovaStub; // for testing
      return null;
    }

    return cordova.plugins.notification.local;
  }

  private notify(profit: string): void {

    this.plugin.schedule({
      id: NotificationService.NOTIFICATION_ID,
      title: `FlutterBot Profit ${profit}`,
      sticky: true,
      smallIcon: 'res://logo.png',
      icon: this.getIcon()
    });
  }

  private requestPermission(): Promise<boolean> {

    return new Promise((resolve, reject) => {
      this.plugin.requestPermission((result) => {
        if (result) {
           resolve(result) ;
        } else {
          reject('permission not granted');
        }
      });
    });
  }
}
