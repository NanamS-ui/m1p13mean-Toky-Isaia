import { Component, Input, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DOCUMENT } from '@angular/common';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  published: boolean;
  description?: string;
  time?: string; // HH:MM
  endTime?: string;
  category?: 'event' | 'promo' | 'meeting' | 'reminder';
}

type CalendarViewMode = 'month' | 'week' | 'agenda';

interface CalendarCell {
  day: number;
  isCurrentMonth: boolean;
  dateStr: string; // YYYY-MM-DD
  isToday: boolean;
  eventCount: number;
  events: CalendarEvent[];
}

interface WeekDay {
  date: Date;
  dateStr: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnDestroy {
  private doc = inject(DOCUMENT);
  
  @Input() set view(value: CalendarViewMode | undefined) {
    if (!value) return;
    this.viewMode.set(value);
  }

  @Input() set events(value: CalendarEvent[]) {
    this.eventsSignal.set(value || []);
  }

  private eventsSignal = signal<CalendarEvent[]>([]);
  currentMonth = signal(new Date());
  currentWeekStart = signal(this.getWeekStart(new Date()));
  viewMode = signal<CalendarViewMode>('agenda');
  selectedDate = signal<string>(this.formatYmd(new Date()));
  isExpanded = signal<boolean>(false);

  private readonly monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  private readonly dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  private readonly shortDayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  monthLabel = computed(() => {
    const d = this.currentMonth();
    return `${this.monthNames[d.getMonth()]} ${d.getFullYear()}`;
  });

  weekLabel = computed(() => {
    const start = this.currentWeekStart();
    const end = this.addDays(start, 6);
    const startMonth = this.monthNames[start.getMonth()];
    const endMonth = this.monthNames[end.getMonth()];
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${startMonth} ${start.getFullYear()}`;
    }
    return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${start.getFullYear()}`;
  });

  weeks = computed(() => {
    const month = this.currentMonth().getMonth();
    const year = this.currentMonth().getFullYear();
    const monthStart = new Date(year, month, 1);
    const gridStart = new Date(year, month, 1 - monthStart.getDay());

    const totalCells = 42;
    const weeks: CalendarCell[][] = [];
    let week: CalendarCell[] = [];

    const today = this.normalizeLocalDate(new Date());
    const ranges = this.eventRanges(this.eventsSignal());

    for (let i = 0; i < totalCells; i++) {
      const cellDate = this.addDays(gridStart, i);
      const cellDateOnly = this.normalizeLocalDate(cellDate);
      const dateStr = this.formatYmd(cellDateOnly);
      const isCurrentMonth = cellDateOnly.getMonth() === month;
      const day = cellDateOnly.getDate();
      const isToday = cellDateOnly.getTime() === today.getTime();

      const cellEvents = ranges
        .filter(r => cellDateOnly >= r.start && cellDateOnly <= r.end)
        .map(r => r.event);
      const eventCount = cellEvents.length;

      week.push({ day, isCurrentMonth, dateStr, isToday, eventCount, events: cellEvents });
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    return weeks;
  });

  weekDays = computed((): WeekDay[] => {
    const start = this.currentWeekStart();
    const today = this.normalizeLocalDate(new Date());
    const ranges = this.eventRanges(this.eventsSignal());
    const days: WeekDay[] = [];

    for (let i = 0; i < 7; i++) {
      const date = this.addDays(start, i);
      const dateOnly = this.normalizeLocalDate(date);
      const dateStr = this.formatYmd(dateOnly);
      const isToday = dateOnly.getTime() === today.getTime();
      
      const dayEvents = ranges
        .filter(r => dateOnly >= r.start && dateOnly <= r.end)
        .sort((a, b) => {
          const timeA = a.event.time || '00:00';
          const timeB = b.event.time || '00:00';
          return timeA.localeCompare(timeB);
        })
        .map(r => r.event);

      days.push({
        date: dateOnly,
        dateStr,
        dayName: this.shortDayNames[dateOnly.getDay()],
        dayNumber: dateOnly.getDate(),
        isToday,
        events: dayEvents
      });
    }

    return days;
  });

  selectedDateLabel = computed(() => {
    const d = this.parseYmdLocal(this.selectedDate());
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(d);
  });

  dayEvents = computed(() => {
    const selected = this.parseYmdLocal(this.selectedDate());
    const selectedDateOnly = this.normalizeLocalDate(selected);
    const ranges = this.eventRanges(this.eventsSignal());
    return ranges
      .filter(r => selectedDateOnly >= r.start && selectedDateOnly <= r.end)
      .sort((a, b) => {
        const timeA = a.event.time || '00:00';
        const timeB = b.event.time || '00:00';
        return timeA.localeCompare(timeB);
      })
      .map(r => r.event);
  });

  monthEvents = computed(() => {
    const month = this.currentMonth().getMonth();
    const year = this.currentMonth().getFullYear();
    const monthStart = this.normalizeLocalDate(new Date(year, month, 1));
    const monthEnd = this.normalizeLocalDate(new Date(year, month + 1, 0));
    const ranges = this.eventRanges(this.eventsSignal());

    return ranges
      .filter(r => r.start <= monthEnd && r.end >= monthStart)
      .sort((a, b) => {
        if (a.start.getTime() !== b.start.getTime()) {
          return a.start.getTime() - b.start.getTime();
        }
        const timeA = a.event.time || '00:00';
        const timeB = b.event.time || '00:00';
        return timeA.localeCompare(timeB);
      })
      .map(r => r.event);
  });

  upcomingEvents = computed(() => {
    const today = this.normalizeLocalDate(new Date());
    const ranges = this.eventRanges(this.eventsSignal());
    
    return ranges
      .filter(r => r.end >= today)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 5)
      .map(r => r.event);
  });

  getCategoryColor(category?: string): string {
    const colors: Record<string, string> = {
      'event': '#8b5cf6',
      'promo': '#f59e0b',
      'meeting': '#3b82f6',
      'reminder': '#10b981'
    };
    return colors[category || 'event'] || colors['event'];
  }

  getCategoryLabel(category?: string): string {
    const labels: Record<string, string> = {
      'event': 'Événement',
      'promo': 'Promotion',
      'meeting': 'Réunion',
      'reminder': 'Rappel'
    };
    return labels[category || 'event'] || labels['event'];
  }

  formatEventRange(event: CalendarEvent): string {
    const start = this.parseYmdLocal(event.date);
    const end = this.parseYmdLocal(event.endDate || event.date);
    const sameDay = this.formatYmd(start) === this.formatYmd(end);

    const fmtStart = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(start);
    const fmtEnd = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(end);

    let dateStr = sameDay ? fmtStart : `${fmtStart} → ${fmtEnd}`;
    
    if (event.time) {
      dateStr = `${event.time} • ${dateStr}`;
    }

    return dateStr;
  }

  formatTime(event: CalendarEvent): string {
    if (!event.time) return 'Journée entière';
    if (event.endTime) {
      return `${event.time} - ${event.endTime}`;
    }
    return event.time;
  }

  getDaysUntil(event: CalendarEvent): string {
    const today = this.normalizeLocalDate(new Date());
    const eventDate = this.parseYmdLocal(event.date);
    const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return 'Passé';
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Demain';
    if (diff <= 7) return `Dans ${diff} jours`;
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(eventDate);
  }

  selectDate(dateStr: string): void {
    this.selectedDate.set(dateStr);
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonth.set(today);
    this.currentWeekStart.set(this.getWeekStart(today));
    this.selectedDate.set(this.formatYmd(today));
  }

  prevMonth(): void {
    const d = new Date(this.currentMonth());
    d.setMonth(d.getMonth() - 1);
    this.currentMonth.set(d);
  }

  nextMonth(): void {
    const d = new Date(this.currentMonth());
    d.setMonth(d.getMonth() + 1);
    this.currentMonth.set(d);
  }

  prevWeek(): void {
    const d = this.addDays(this.currentWeekStart(), -7);
    this.currentWeekStart.set(d);
  }

  nextWeek(): void {
    const d = this.addDays(this.currentWeekStart(), 7);
    this.currentWeekStart.set(d);
  }

  setView(mode: CalendarViewMode): void {
    this.viewMode.set(mode);
  }

  toggleExpanded(): void {
    this.isExpanded.update(v => !v);
    if (this.isExpanded()) {
      this.doc.body.classList.add('calendar-expanded');
    } else {
      this.doc.body.classList.remove('calendar-expanded');
    }
  }

  closeExpanded(): void {
    this.isExpanded.set(false);
    this.doc.body.classList.remove('calendar-expanded');
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return this.normalizeLocalDate(d);
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  private normalizeLocalDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private formatYmd(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private parseYmdLocal(ymd: string): Date {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }

  private eventRanges(events: CalendarEvent[]): Array<{ event: CalendarEvent; start: Date; end: Date }> {
    return (events || []).map(event => {
      const start = this.normalizeLocalDate(this.parseYmdLocal(event.date));
      const end = this.normalizeLocalDate(this.parseYmdLocal(event.endDate || event.date));
      return { event, start, end: end >= start ? end : start };
    });
  }

  ngOnDestroy(): void {
    this.doc.body.classList.remove('calendar-expanded');
  }
}
