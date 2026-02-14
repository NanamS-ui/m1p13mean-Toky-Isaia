import { Stock } from './stock.model';

export class Price {
  _id: string;
  price: number;
  started_date: Date;
  end_date: Date;
  stock: Stock;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;

  constructor(init?: Partial<Price>) {
    this._id = init?._id || '';
    this.price = init?.price ?? 0;

    this.started_date = init?.started_date
      ? new Date(init.started_date)
      : new Date();

    this.end_date = init?.end_date
      ? new Date(init.end_date)
      : new Date();

    this.stock = init?.stock
      ? new Stock(init.stock)
      : new Stock();

    this.deleted_at = init?.deleted_at ?? null;

    this.created_at = init?.created_at
      ? new Date(init.created_at)
      : new Date();

    this.updated_at = init?.updated_at
      ? new Date(init.updated_at)
      : new Date();
  }

  /**
   * Vérifie si le prix est actuellement actif
   */
  isActive(): boolean {
    const now = new Date();
    return (
      !this.deleted_at &&
      now >= this.started_date &&
      now <= this.end_date
    );
  }

  /**
   * Vérifie si le prix est expiré
   */
  isExpired(): boolean {
    return new Date() > this.end_date;
  }
}
