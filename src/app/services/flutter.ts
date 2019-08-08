'use strict';

import {EventEmitter, Injectable, NgZone} from '@angular/core';
import { PollingService } from './polling';

@Injectable()
export class FlutterService {

  private static IN_PLAY_URL: string = 'https://flutterbot.co.uk/api/stats?df=DATE&dt=DATE&groupings=["All"]&dsFilters={InPlay: true}&specialFilters={}';
  private static OVERALL_URL: string = 'https://flutterbot.co.uk/api/stats?df=DATE&dt=DATE&groupings=["All"]&dsFilters={}&specialFilters={}';
  private static SNOWBALL_URL: string = 'https://snowball.flutterbot.co.uk/api/stats?df=DATE&dt=DATE&groupings=["All"]&dsFilters={}&specialFilters={}';

  private inPlay: PollingService;
  private overall: PollingService;
  private snowball: PollingService;

  public profitUpdate: EventEmitter<{}> = new EventEmitter<{}>();

  constructor(zone: NgZone) {
    this.inPlay = new PollingService(FlutterService.IN_PLAY_URL, zone);
    this.overall = new PollingService(FlutterService.OVERALL_URL, zone);
    this.snowball = new PollingService(FlutterService.SNOWBALL_URL, zone);

    this.inPlay.profitUpdate
      .subscribe(({profit, trend}) => this.profitUpdate.emit({type: 'IN_PLAY', profit, trend}));
    this.overall.profitUpdate
      .subscribe(({profit, trend}) => this.profitUpdate.emit({type: 'OVERALL', profit, trend}));
    this.snowball.profitUpdate
      .subscribe(({profit, trend}) => this.profitUpdate.emit({type: 'SNOWBALL', profit, trend}));

  }

  public get profit() {
    return {
      inPlay: this.inPlay.profit,
      overall: this.overall.profit,
      snowball: this.snowball.profit,
    };
  }
}
