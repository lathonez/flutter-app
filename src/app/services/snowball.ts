'use strict';

import { Injectable, NgZone } from '@angular/core';
import { FlutterService } from './flutter';

@Injectable()
export class SnowballService extends FlutterService {

  protected _url: string = 'https://snowball.flutterbot.co.uk/api/stats?df=DATE&dt=DATE&groupings=["MarketType"]&dsFilters={}&specialFilters={}';

  constructor(zone: NgZone) {
    super(zone);
  }
}
