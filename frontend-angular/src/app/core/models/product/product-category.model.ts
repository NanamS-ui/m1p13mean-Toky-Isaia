export class ProductCategory {
  _id: string;
  value: string;
  created_at: Date;
  updated_at: Date;

  constructor(init?: Partial<ProductCategory>) {
    this._id = init?._id || '';
    this.value = init?.value || '';
    this.created_at = init?.created_at || new Date();
    this.updated_at = init?.updated_at || new Date();
  }
}
