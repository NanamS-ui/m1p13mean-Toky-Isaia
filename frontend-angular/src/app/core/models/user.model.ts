export type UserRole = 'ADMIN' | 'BOUTIQUE' | 'ACHETEUR';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'PENDING';

export class User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  adresse?: string;
  avatarUrl?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  boutiqueId?: string;

  constructor(init?: Partial<User>) {
    this.id = init?.id || '';
    this.email = init?.email || '';
    this.firstName = init?.firstName || '';
    this.lastName = init?.lastName || '';
    this.role = init?.role || 'ACHETEUR'; 
    this.status = init?.status || 'ACTIVE';
    this.phone = init?.phone;
    this.adresse = init?.adresse;
    this.avatarUrl = init?.avatarUrl;
    this.createdAt = init?.createdAt || new Date();
    this.lastLoginAt = init?.lastLoginAt;
    this.boutiqueId = init?.boutiqueId;
  }
}


export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  adresse: string;
}

export interface AuthUser extends User {
  token: string;
  permissions: string[];
  refreshToken?: string;
}
