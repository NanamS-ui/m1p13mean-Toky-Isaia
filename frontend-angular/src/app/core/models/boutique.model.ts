export type BoutiqueCategory = 'MODE' | 'FOOD' | 'TECH' | 'BEAUTE' | 'SPORT' | 'MAISON' | 'AUTRE';

export type BoutiqueStatus = 'PENDING' | 'ACTIVE' | 'DISABLED' | 'REJECTED';

export interface Boutique {
  id: string;
  name: string;
  description: string;
  category: BoutiqueCategory;
  status: BoutiqueStatus;
  ownerId: string;
  ownerEmail: string;
  zone?: string;
  surfaceM2: number;
  monthlyRent: number;
  rentPaidUntil?: Date;
  createdAt: Date;
  validatedAt?: Date;
  logoUrl?: string;
}

export const BOUTIQUE_CATEGORIES: { value: BoutiqueCategory; label: string }[] = [
  { value: 'MODE', label: 'Mode' },
  { value: 'FOOD', label: 'Restaurant / Food' },
  { value: 'TECH', label: 'Tech & Électronique' },
  { value: 'BEAUTE', label: 'Beauté & Bien-être' },
  { value: 'SPORT', label: 'Sport' },
  { value: 'MAISON', label: 'Maison & Décoration' },
  { value: 'AUTRE', label: 'Autre' }
];
