import { Order } from './order.model';

export class OrderItem {
  _id?: string;
  unit_price: number;
  promotion_percentage?: number;
  quantity: number;
  stock: string; // ObjectId du stock
  order: Order | string; // peut être objet ou ObjectId
  deleted_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;

  constructor(data?: Partial<OrderItem>) {
    this._id = data?._id;
    this.unit_price = data?.unit_price || 0;
    this.promotion_percentage = data?.promotion_percentage || 0;
    this.quantity = data?.quantity || 1;
    this.stock = data?.stock!;
    this.order = data?.order!;
    this.deleted_at = data?.deleted_at ?? null;
    this.created_at = data?.created_at;
    this.updated_at = data?.updated_at;
  }
}
