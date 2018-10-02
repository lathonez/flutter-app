import { Component } from '@angular/core';
import { FlutterService } from '../../app/services/flutter';
import { NotificationService } from '../../app/services/notification';
import { SnowballService } from '../../app/services/snowball';
import { InPlayService } from "../../app/services/in-play";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public flutter: FlutterService;
  public inPlay: InPlayService;
  public notification: NotificationService;
  public snowball: SnowballService;

  constructor(flutter: FlutterService, inPlay: InPlayService, snowball: SnowballService, notification: NotificationService) {
    this.flutter = flutter;
    this.inPlay = inPlay;
    this.notification = notification;
    this.snowball = snowball;
  }

  public ngOnInit() {
    this.flutter.eventLoop();
    this.inPlay.eventLoop();
    this.snowball.eventLoop();
  }
}
