'use strict';

import {EventEmitter, NgZone} from '@angular/core';
import * as moment from 'moment';

export interface FlutterResponse {
  All: Array<{
    Net: {
      Profit: number
    }
  }>;
}

export class PollingService {

  private static POLL_DELAY: number = 10000;

  private _url: string;
  private _profit: number;
  private _cashout: number;
  private _expected: number;
  private _stale: boolean = false;
  private _trend: boolean = null;
  private _updated: string;

  private pollTimeoutHandle: number;
  private zone: NgZone;

  public profitUpdate: EventEmitter<{}> = new EventEmitter<{}>();

  constructor(url: string, zone: NgZone) {
    this._url = url;
    this.zone = zone;
    this.eventLoop();
  }

  public get profit(): number {
    return this._profit;
  }

  public get cashout(): number {
    return this._cashout;
  }

  public get expected(): number {
    return this._expected;
  }

  public get stale(): boolean {
    return this._stale;
  }

  public get trend(): boolean {
    return this._trend;
  }

  public get updated(): string {
    return this._updated;
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

  private responseHandler(response: Response): Promise<{}> {
    return response.json()
      .then((json: FlutterResponse) => {

        if (!json.All || !json.All.length || !json.All[0].Net) {
          throw 'no profit found in response';
        }

        this._stale = false;

        return json.All[0].Net;
      });
  }

  private poll(): Promise<string> {

    const date: string = moment().format('YYYY-MM-DD');

    return fetch(this._url.replace(/DATE/g, date))
      .then(response => this.responseHandler(response))
      .then(newSummary => {
        this._updated = moment().format('HH:mm');

        if (this._profit === newSummary['Profit']) {
          console.log(`Profit static @ ${this._profit}`);
          return this._profit;
        }

        this._trend = PollingService.getTrend(this._profit, newSummary['Profit']);

        console.log(`Updated profit from ${this._profit} to ${newSummary['Profit']}`);

        this._profit = newSummary['Profit'];
        this._cashout = newSummary['CashoutValueExclLargeSpread'];
        this._expected = newSummary['ExpectedProfit'];

        this.profitUpdate.emit({ profit: this.profit, cashout: this.cashout, expected: this.expected, trend: this.trend});
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
      this.zone.runOutsideAngular(() => this.pollTimeoutHandle = setTimeout(resolve, PollingService.POLL_DELAY));
    });
  }
}
