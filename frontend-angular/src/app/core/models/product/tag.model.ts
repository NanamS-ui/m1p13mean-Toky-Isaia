export class Tag {
  _id: string;
  value: string;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;

  constructor(init?: Partial<Tag>) {
    this._id = init?._id || '';
    this.value = init?.value || '';
    this.deleted_at = init?.deleted_at ?? null;
    this.created_at = init?.created_at || new Date();
    this.updated_at = init?.updated_at || new Date();
  }
}
