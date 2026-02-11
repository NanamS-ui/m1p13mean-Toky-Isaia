import { Suspension } from "../suspension/suspension.model";
import { User } from "../user.model";
import { Door } from "./door.model";
import { ShopCategory } from "./shopCategory.model";
import { ShopStatus } from "./shopStatus.model";

export interface Shop {
  _id: string;              
  name: string;
  logo?: string;
  is_accepted: boolean;
  suspensions: Suspension[];
  door: string | Door;       
  shop_category:  ShopCategory;
  shop_status:  ShopStatus;
  owner:  User;
  deleted_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}