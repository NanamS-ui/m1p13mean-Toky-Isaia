import { Shop } from '../shop/shop.model';
import { Price } from './price.model';
import { Product } from './product.model';
import { Promotion } from './promotion.model';


export class Stock {
  _id: string;
  in: number;
  out: number;
  reste: number;
  product: Product;
  shop: Shop; 
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
  current_price : Price;
  current_promotion : Promotion;

  constructor(init?: Partial<Stock>) {
    this._id = init?._id || '';
    this.in = init?.in ?? 0;
    this.out = init?.out ?? 0;
    this.reste = init?.reste ?? 0;

    this.product = init?.product
      ? new Product(init.product)
      : new Product();

    this.shop = init?.shop || new Shop();
    this.current_price = init?.current_price || new Price();
    this.current_promotion = init?.current_promotion || new Promotion();
    this.deleted_at = init?.deleted_at ?? null;
    this.created_at = init?.created_at || new Date();
    this.updated_at = init?.updated_at || new Date();
  }
}
export class StockView{
  stock : Stock;
  current_price : Price;
  current_promotion : Promotion;
  constructor(init?: Partial<StockView>) {
    this.stock = new Stock();
    this.current_price = new Price;
    this.current_promotion = new Promotion();
  }

}
