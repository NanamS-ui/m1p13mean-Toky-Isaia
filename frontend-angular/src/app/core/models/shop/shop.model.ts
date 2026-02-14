import { Suspension } from "../suspension/suspension.model";
import { User } from "../user.model";
import { Door } from "./door.model";
import { ShopCategory } from "./shopCategory.model";
import { ShopStatus } from "./shopStatus.model";
import { OpeningHourShop } from "./openingHours.model";
export class Shop {
  _id: string;
  name: string;
  logo?: string;
  banner?: string;
  phone?: string;
  email?: string;
  description: string;
  is_accepted: boolean;
  suspensions: Suspension[];
  opening_hours: OpeningHourShop[];
  isOpenNow?: boolean;
  door: Door;
  shop_category: ShopCategory;
  shop_status: ShopStatus;
  owner: User;
  deleted_at?: Date | null;
  created_at: Date;
  updated_at: Date;

  constructor(init?: Partial<Shop>) {
    this._id = init?._id || '';
    this.name = init?.name || '';
    this.logo = init?.logo;
    this.banner = init?.banner;
    this.phone = init?.phone;
    this.email = init?.email;
    this.description = init?.description || '';
    this.is_accepted = init?.is_accepted ?? false;
    this.suspensions = init?.suspensions || [];
    this.opening_hours = init?.opening_hours || [];
    this.door = init?.door || new Door();
    this.shop_category = init?.shop_category || {} as ShopCategory;
    this.shop_status = init?.shop_status || {} as ShopStatus;
    this.owner = init?.owner || new User();
    this.deleted_at = init?.deleted_at || null;
    this.created_at = init?.created_at || new Date();
    this.updated_at = init?.updated_at || new Date();
  }
}