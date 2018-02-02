'use strict';

import {Injectable, NgZone} from '@angular/core';
import * as moment from 'moment';

export interface FlutterResponse {
  MarketType: Array<{
    Net: {
      Profit: number
    }
  }>;
}

@Injectable()
export class FlutterService {

  private static POLL_DELAY: number = 10000;
  private static BASE_URL: string = 'http://3.flutterbot.co.uk/api';

  private _profit: string;
  private _stale: boolean = false;

  private pollTimeoutHandle: number;
  private zone: NgZone;

  constructor(zone: NgZone) {
    this.eventLoop();
    this.zone = zone;
  }

  public get profit(): string {
    if (!this._profit) {
      return '--.--';
    }
    return this._profit;
  }

  public get stale(): boolean {
    return this._stale;
  }

  private eventLoop(): void {
    this.poll()
      .then(() => this.waitForPollDelay())
      .then(() => this.eventLoop());
  }
  private poll(): Promise<Response> {

    let date: string = moment().format('YYYY-MM-DD');
    let url: string = FlutterService.BASE_URL + `/stats?df=${date}&dt=${date}&groupings=["MarketType"]&dsFilters={}&specialFilters={}`;

    return fetch(url)
      .then(raw => raw.json())
      .then((json: FlutterResponse) => {
        if (!json.MarketType || !json.MarketType.length || !json.MarketType[0].Net) {
          throw 'no profit found in response';
        }

        this._profit = json.MarketType[0].Net.Profit.toFixed(2);
        console.log('Updated profit to ' + this._profit);
        this._stale = false;

        return json;
      })
      .catch(err => {
        console.error(err);
        this._stale = true;
        return Promise.resolve(null);
      }
    )
  }

  private waitForPollDelay(): Promise<{}> {

    if (this.pollTimeoutHandle) {
      clearTimeout(this.pollTimeoutHandle);
    }

    return new Promise(resolve => {
      this.zone.runOutsideAngular(() => this.pollTimeoutHandle = setTimeout(resolve, FlutterService.POLL_DELAY));
    });
  }
}
