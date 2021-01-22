import { Component, OnInit } from '@angular/core';
import {BridgeService} from '../../services/bridge/bridge.service';
import {BridgeNetwork, ITableTransaction} from '../../services/bridge/types';
import {List} from 'immutable';
import date from 'date-and-time';

@Component({
  selector: 'app-bridge-table',
  templateUrl: './bridge-table.component.html',
  styleUrls: ['./bridge-table.component.scss'],
  providers: [BridgeService]
})
export class BridgeTableComponent implements OnInit {

  public Blockchains = {
    [BridgeNetwork.ETHEREUM] : {
      label: "Ethereum",
      img: "eth.png",
      symbolPropName: 'ethSymbol'
    },
    [BridgeNetwork.BINANCE_SMART_CHAIN]: {
      label: "Binance Smart Chain",
      img: "bnb.svg",
      symbolPropName: 'bscSymbol'
    }
  }

  public transactions: List<ITableTransaction> = List([]);
  public updateProcess: boolean = false;
  public sort: {columnIndex: number, downDirection: boolean} = {columnIndex: 5, downDirection: true};

  constructor(private bridgeService: BridgeService) {
    bridgeService.transactions.subscribe(transactions => this.transactions = transactions.sort(
        (a, b) => BridgeTableComponent.sortByDate(a.creationTime, b.creationTime)
    ));
  }

  ngOnInit() {
  }

  public onUpdate() {
    if (!this.updateProcess) {
      this.updateProcess = true;
      this.bridgeService.updateTransactionsList().finally(() => this.updateProcess = false);
    }
  }

  public onSortClick(columnIndex: number) {

    if (columnIndex === this.sort.columnIndex) {
      this.sort.downDirection = !this.sort.downDirection;
      this.transactions = this.transactions.reverse();

    } else  {

      switch (columnIndex) {
        case 0:
          this.transactions = this.transactions.sort((a, b) =>
              a.status > b.status ? -1 : 1);
          break;
        case 1:
          this.transactions = this.transactions.sort((a, b) =>
              a.fromNetwork > b.fromNetwork ? -1 : 1);
          break;
        case 2:
          this.transactions = this.transactions.sort((a, b) =>
              a.toNetwork > b.toNetwork ? -1 : 1);
          break;
        case 3:
          this.transactions = this.transactions.sort((a, b) =>
              BridgeTableComponent.sortByNumber(a.actualFromAmount, b.actualFromAmount));
          break;
        case 4:
          this.transactions = this.transactions.sort((a, b) =>
              BridgeTableComponent.sortByNumber(a.actualToAmount, b.actualToAmount));
          break;
        case 5:
          this.transactions = this.transactions.sort((a, b) =>
              BridgeTableComponent.sortByDate(a.creationTime, b.creationTime));
          break;
      }

      this.sort.columnIndex = columnIndex;
      this.sort.downDirection = true;
    }
  }

  private static sortByDate (a: string, b: string): number  {
    const date1 = new Date(date.transform(a, 'D-M-YYYY H:m', 'YYYY/MM/DD HH:mm:ss'));
    const date2 = new Date(date.transform(b, 'D-M-YYYY H:m', 'YYYY/MM/DD HH:mm:ss'));
    return date.subtract(date2, date1).toMilliseconds();
  }

  private static sortByNumber (a: number, b: number): number {
    return b - a;
  }

  public getArrow(index) {
    if (index !== this.sort.columnIndex) {
      return 'Arrows.svg';
    }

    return this.sort.downDirection ? 'Arrows-down.svg' : 'Arrows-up.svg';
  }
}