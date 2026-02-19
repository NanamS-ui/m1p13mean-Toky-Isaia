import { EventCategory } from './event-category.model';

export interface EventEntity {
  _id: string;
  title: string;
  description?: string | null;
  started_date: string; // ISO string
  end_date?: string | null; // ISO string
  all_day: boolean;
  start_time?: string | null; // HH:MM
  end_time?: string | null;
  published: boolean;
  category?: EventCategory | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  category?: string; // value
  image?: string; // base64 dataUrl
}
