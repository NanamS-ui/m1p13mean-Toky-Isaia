export type UserRole = 'ADMIN' | 'BOUTIQUE' | 'ACHETEUR';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'PENDING';

export interface User {
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
  boutiqueId?: string; // pour profil BOUTIQUE
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
