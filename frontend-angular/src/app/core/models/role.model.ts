export interface Permission {
  id: string;
  code: string;
  label: string;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}
