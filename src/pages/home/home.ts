import { Component } from '@angular/core';
import { FlutterService } from '../../app/services/flutter';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public flutter: FlutterService;

  constructor(flutter: FlutterService) {
    this.flutter = flutter;
  }
}
