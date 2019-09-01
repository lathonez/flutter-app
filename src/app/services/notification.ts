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
      this.notify({type: 'ENABLED', profit: null, trend: null});
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
        this.notify({type: 'INIT', profit: null, trend: null});
        this.flutter.profitUpdate.subscribe(update => this.notify(update));
      })
      .catch(error => {
        console.error('an error occurred registering plugins');
        console.error(error);
      });
  }

  private get profit(): string {
    const { overall, inPlay, snowball } = this.flutter.profit;
    return `Normal: ${overall}\nDogs: ${snowball}\nIP: ${inPlay}`;
  }

  private clear(): void {
    this.plugin.clear(NotificationService.NOTIFICATION_ID);
  }

  private getIcon(trend: boolean): string {

    if (trend === null) {
      return NotificationService.UNKNOWN_ICON;
    }

    return trend ? NotificationService.UP_ICON : NotificationService.DOWN_ICON;
  }

  private static getPlugin(): any {
    if (typeof cordova === 'undefined') {
      // return this.cordovaStub; // for testing
      return null;
    }

    return cordova.plugins.notification.local;
  }

  private notify({ type, profit, trend }): void {

    if (!this.enabled) {
      return;
    }

    console.log(`Scheduling notification ${type} ${profit} ${trend}`);

    this.plugin.schedule({
      id: NotificationService.NOTIFICATION_ID,
      title: `FlutterBot Profit`,
      text: this.profit,
      sticky: true,
      smallIcon: 'res://logo.png',
      icon: this.getIcon(trend),
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
