import { Component } from '@angular/core';
import { FlutterService } from '../../app/services/flutter';
import { NotificationService } from '../../app/services/notification';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public flutter: FlutterService;
  public notification: NotificationService;

  constructor(flutter: FlutterService, notification: NotificationService) {
    this.flutter = flutter;
    this.notification = notification;
  }
}
