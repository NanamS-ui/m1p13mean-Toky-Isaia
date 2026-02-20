export interface EventCategory {
  _id: string;
  // Nouveau schéma (events) :
  value?: string;
  label?: string | null;
  created_at?: string;
  updated_at?: string;

  // Ancien / autres collections possibles :
  name?: string;
  color?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}
