import { Product } from './product.model';
export class StockView{
    
}
export class Stock {
  _id: string;
  in: number;
  out: number;
  reste: number;
  product: Product;
  shop: string; // ou Shop si tu as la classe
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;

  constructor(init?: Partial<Stock>) {
    this._id = init?._id || '';
    this.in = init?.in ?? 0;
    this.out = init?.out ?? 0;
    this.reste = init?.reste ?? 0;

    this.product = init?.product
      ? new Product(init.product)
      : new Product();

    this.shop = init?.shop || '';
    this.deleted_at = init?.deleted_at ?? null;
    this.created_at = init?.created_at || new Date();
    this.updated_at = init?.updated_at || new Date();
  }
}
