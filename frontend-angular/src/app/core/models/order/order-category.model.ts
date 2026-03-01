export class OrderCategory {
  _id?: string;
  value: string;
  created_at?: Date;
  updated_at?: Date;

  constructor(data?: Partial<OrderCategory>) {
    this._id = data?._id;
    this.value = data?.value || '';
    this.created_at = data?.created_at;
    this.updated_at = data?.updated_at;
  }
}
