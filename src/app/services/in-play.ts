'use strict';

import { Injectable, NgZone } from '@angular/core';
import { FlutterService } from './flutter';

@Injectable()
export class InPlayService extends FlutterService {

  protected _url: string = 'https://flutterbot.co.uk/api/stats?df=DATE&dt=DATE&groupings=["MarketType"]&dsFilters={InPlay: true}&specialFilters={}';

  constructor(zone: NgZone) {
    super(zone);
  }
}
