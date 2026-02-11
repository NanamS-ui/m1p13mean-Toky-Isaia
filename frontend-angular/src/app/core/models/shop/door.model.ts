import { Floor } from "./floor.model";

export interface Door {
  _id: string;
  value: string;
  floor: string | Floor;
}