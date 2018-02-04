'use strict';

import {EventEmitter, Injectable, NgZone} from '@angular/core';
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

  private _profit: number;
  private _stale: boolean = false;
  private _trend: boolean = null;

  private pollTimeoutHandle: number;
  private zone: NgZone;

  public profitUpdate: EventEmitter<string> = new EventEmitter<string>();

  constructor(zone: NgZone) {
    this.eventLoop();
    this.zone = zone;
  }

  public get profit(): string {
    if (!this._profit) {
      return '£--.--';
    }
    return `£${this._profit.toFixed(2) + (this.stale ? '*' : '')}`;
  }

  public get stale(): boolean {
    return this._stale;
  }

  public get trend(): boolean {
    return this._trend;
  }

  private eventLoop(): void {
    this.poll()
      .then(() => this.waitForPollDelay())
      .then(() => this.eventLoop());
  }

  private static getTrend(currentProfit: number, newProfit: number): boolean {

    switch(true) {
      // LOSS
      case typeof currentProfit === 'undefined' && newProfit < 0:
        return false;
      case currentProfit > newProfit:
        return false;
      // PROFIT
      case typeof currentProfit === 'undefined' && newProfit > 0:
        return true;
      case currentProfit < newProfit:
        return true;
    }
  }

  private responseHandler(response: Response): Promise<number> {
    return response.json()
      .then((json: FlutterResponse) => {

        // if (!json.MarketType || !json.MarketType.length || !json.MarketType[0].Net) {
        //   throw 'no profit found in response';
        // }

        this._stale = false;

        // return json.MarketType[0].Net.Profit;
        return Math.random() * 100;
      });
  }

  private poll(): Promise<string> {

    let date: string = moment().format('YYYY-MM-DD');
    let url: string = FlutterService.BASE_URL + `/stats?df=${date}&dt=${date}&groupings=["MarketType"]&dsFilters={}&specialFilters={}`;

    return fetch(url)
      .then(response => this.responseHandler(response))
      .then(newProfit => {

        if (this._profit === newProfit) {
          console.log(`Profit static @ ${this._profit}`);
          return this._profit;
        }

        this._trend = FlutterService.getTrend(this._profit, newProfit);

        console.log(`Updated profit from ${this._profit} to ${newProfit}`);

        this._profit = newProfit;

        this.profitUpdate.emit(this.profit);
        return this._profit;
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
