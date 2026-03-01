import { User } from '../user.model';
import { OrderCategory } from './order-category.model';
import { OrderItem } from './order-item.model';

export class Order {
  _id?: string;
  total: number;
  orderCategory: OrderCategory; 
  buyer: User;
  deleted_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
  orderItems? : OrderItem[];

  constructor(data?: Partial<Order>) {
    this._id = data?._id;
    this.total = data?.total || 0;
    if (!data?.orderCategory) {
      throw new Error('orderCategory is required');
    }
    this.orderCategory = data?.orderCategory;

    if (!data?.buyer) {
      throw new Error('buyer is required');
    }
    this.buyer = data?.buyer;
    this.deleted_at = data?.deleted_at ?? null;
    this.created_at = data?.created_at;
    this.updated_at = data?.updated_at;
    this.orderItems = data?.orderItems??[];
  }
}
