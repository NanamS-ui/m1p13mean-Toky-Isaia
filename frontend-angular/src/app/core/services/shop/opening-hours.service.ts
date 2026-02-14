import { Injectable } from '@angular/core';
import type { OpeningHourShop } from '../../models/shop/openingHours.model';
import type { Shop } from '../../models/shop/shop.model';

const FRENCH_DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as const;

@Injectable({ providedIn: 'root' })
export class OpeningHoursService {
  /**
   * Indique si une boutique est ouverte à l'instant donné selon ses horaires (Shop.opening_hours).
   */
  isShopOpenNow(shop: Shop, atDate: Date = new Date()): boolean {
    return this.computeIsOpenNow(shop.opening_hours || [], atDate);
  }

  /**
   * Calcule si une boutique est ouverte selon les horaires à une date donnée.
   */
  computeIsOpenNow(openingHours: OpeningHourShop[], atDate: Date = new Date()): boolean {
    if (!openingHours?.length) return false;

    const dayIndex = atDate.getDay();
    const dayName = FRENCH_DAYS[dayIndex];
    const today = openingHours.find((h) => h?.day === dayName);

    if (!today || !today.isOpen) return false;

    const currentMins = atDate.getHours() * 60 + atDate.getMinutes();
    const openMins = this.parseTimeToMinutes(today.openTime);
    const closeMins = this.parseTimeToMinutes(today.closeTime);

    if (openMins <= closeMins) {
      return currentMins >= openMins && currentMins < closeMins;
    }
    return currentMins >= openMins || currentMins < closeMins;
  }

  private parseTimeToMinutes(time: string): number {
    if (!time || typeof time !== 'string') return 0;
    const [h, m] = time.trim().split(':').map(Number);
    const hours = Number.isNaN(h) ? 0 : Math.max(0, Math.min(23, h));
    const mins = Number.isNaN(m) ? 0 : Math.max(0, Math.min(59, m));
    return hours * 60 + mins;
  }
}
