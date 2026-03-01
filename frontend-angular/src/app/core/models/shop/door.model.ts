import { Floor } from "./floor.model";

export class Door {
  _id: string;
  value: string;
  floor:  Floor;
  constructor(init?:Partial<Door>){
    this._id = init?._id || '';
    this.value = init?.value || '';
    this.floor = init?.floor || new Floor();
  }
}