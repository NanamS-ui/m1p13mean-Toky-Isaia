import { Stock } from './stock.model';

export class Promotion {
  _id: string;
  percent: number;
  stock: Stock;
  started_date: Date;
  end_date: Date;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;

  constructor(init?: Partial<Promotion>) {
    this._id = init?._id || '';
    this.percent = init?.percent ?? 0;

    this.stock = init?.stock
      ? new Stock(init.stock)
      : new Stock();

    this.started_date = init?.started_date
      ? new Date(init.started_date)
      : new Date();

    this.end_date = init?.end_date
      ? new Date(init.end_date)
      : new Date();

    this.deleted_at = init?.deleted_at ?? null;
    this.created_at = init?.created_at || new Date();
    this.updated_at = init?.updated_at || new Date();
  }
}
