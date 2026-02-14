export class Floor {
  _id: string; 
  value: string;
  constructor(init?:Partial<Floor>){
    this._id = init?._id || '';
    this.value = init?.value || '';
  }
}
