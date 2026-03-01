import { ProductCategory } from './product-category.model';
import { Tag } from './tag.model';

export class Product {
  _id: string;
  name: string;
  description: string;
  reference: string;
  poids: number;
  dimension: string;
  image?: string;
  product_category: ProductCategory;
  tags: Tag[];
  created_at: Date;
  updated_at: Date;

  constructor(init?: Partial<Product>) {
    this._id = init?._id || '';
    this.name = init?.name || '';
    this.description = init?.description || '';
    this.reference = init?.reference || '';
    this.poids = init?.poids ?? 0;
    this.dimension = init?.dimension || '';
    this.image = init?.image;

    this.product_category = init?.product_category
      ? new ProductCategory(init.product_category)
      : new ProductCategory();

    this.tags = init?.tags
      ? init.tags.map(tag => new Tag(tag))
      : [];

    this.created_at = init?.created_at || new Date();
    this.updated_at = init?.updated_at || new Date();
  }
}
