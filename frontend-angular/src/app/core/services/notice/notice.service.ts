import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type NoticeType = 'shop' | 'product';
export type NoticeStatus = 'published' | 'pending';

export interface NoticeUserDto {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
}

export interface NoticeShopDto {
  _id: string;
  name?: string;
  logo?: string;
}

export interface NoticeProductDto {
  _id: string;
  name?: string;
  image?: string;
}

export interface NoticeOrderDto {
  _id: string;
}

export interface NoticeDto {
  _id: string;
  type: NoticeType;
  rating: number;
  comment: string;
  status: NoticeStatus;
  user?: NoticeUserDto | string;
  shop?: NoticeShopDto | string | null;
  product?: NoticeProductDto | string | null;
  order?: NoticeOrderDto | string | null;
  response?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateNoticePayload {
  type: NoticeType;
  rating: number;
  comment: string;
  shopId?: string;
  productId?: string;
  orderId?: string;
}

export interface ShopNoticeSummaryDto {
  shopId: string;
  rating: number;
  reviewCount: number;
}

@Injectable({ providedIn: 'root' })
export class NoticeService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getMyNotices(type?: NoticeType): Observable<NoticeDto[]> {
    const qs = type ? `?type=${encodeURIComponent(type)}` : '';
    return this.http.get<NoticeDto[]>(`${this.apiBaseUrl}/notices/mine${qs}`);
  }

  getNoticesByShop(shopId: string): Observable<NoticeDto[]> {
    return this.http.get<NoticeDto[]>(`${this.apiBaseUrl}/notices/by-shop?shopId=${encodeURIComponent(shopId)}`);
  }

  getNoticesByProduct(productId: string): Observable<NoticeDto[]> {
    return this.http.get<NoticeDto[]>(`${this.apiBaseUrl}/notices/by-product?productId=${encodeURIComponent(productId)}`);
  }

  getShopSummaries(shopIds: string[]): Observable<ShopNoticeSummaryDto[]> {
    const ids = Array.isArray(shopIds) ? shopIds.filter(Boolean) : [];
    if (ids.length === 0) return of([]);
    const qs = ids.map(id => encodeURIComponent(id)).join(',');
    return this.http.get<ShopNoticeSummaryDto[]>(`${this.apiBaseUrl}/notices/summary/by-shops?shopIds=${qs}`);
  }

  createNotice(payload: CreateNoticePayload): Observable<NoticeDto> {
    return this.http.post<NoticeDto>(`${this.apiBaseUrl}/notices`, payload);
  }

  updateMyNotice(id: string, payload: { rating?: number; comment?: string }): Observable<NoticeDto> {
    return this.http.put<NoticeDto>(`${this.apiBaseUrl}/notices/${encodeURIComponent(id)}`, payload);
  }

  deleteMyNotice(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBaseUrl}/notices/${encodeURIComponent(id)}`);
  }
}
