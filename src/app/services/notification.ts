'use strict';

import { Injectable } from '@angular/core';
import { FlutterService } from './flutter';
import { SnowballService } from './snowball';
import { InPlayService } from './in-play';

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
  private inPlay: InPlayService;
  private snowball: SnowballService;

  private plugin: any;

  constructor(flutter: FlutterService, inPlay: InPlayService, snowball: SnowballService) {
    this.flutter = flutter;
    this.inPlay = inPlay;
    this.snowball = snowball;
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
      this.notify();
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
        this.notify();
        this.flutter.profitUpdate.subscribe(() => this.notify());
        this.inPlay.profitUpdate.subscribe(() => this.notify());
        this.snowball.profitUpdate.subscribe(() => this.notify());
      })
      .catch(error => {
        console.error('an error occurred registering plugins');
        console.error(error);
      });
  }

  private get profit(): string {
    return `Overall: ${this.flutter.profit}\nSnowball: ${this.snowball.profit}\nInPlay: ${this.inPlay.profit}`;
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

  private notify(): void {

    if (!this.enabled) {
      return;
    }

    this.plugin.schedule({
      id: NotificationService.NOTIFICATION_ID,
      title: `FlutterBot Profit`,
      text: this.profit,
      sticky: true,
      smallIcon: 'res://logo.png',
      icon: this.getIcon(),
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
