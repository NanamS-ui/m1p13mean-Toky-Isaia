import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarComponent, type CalendarEvent } from './calendar/calendar.component';
import { EventService } from '../../../core/services/events/event.service';
import { EventCategoryService } from '../../../core/services/events/event-category.service';
import { EventEntity } from '../../../core/models/events/event.model';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-communication',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CalendarComponent],
  templateUrl: './communication.component.html',
  styleUrl: './communication.component.css'
})
export class CommunicationComponent implements OnInit {
  form: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isDragOver = false;
  isSubmitting = false;
  eventsLoadError = '';

  private readonly categoryColors: Record<string, string> = {
    event: '#8b5cf6',
    promo: '#f59e0b',
    meeting: '#3b82f6',
    reminder: '#10b981'
  };

  categories: { id: string; value: string; label: string; color: string }[] = [];

  events: CalendarEvent[] = [];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private eventCategoryService: EventCategoryService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.nonNullable.group({
      title: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      startTime: [''],
      endTime: [''],
      category: [''],
      allDay: [true]
    });
  }

  ngOnInit(): void {
    this.eventCategoryService.getEventCategories().subscribe({
      next: (cats) => {
        if (!cats || cats.length === 0) return;
        this.categories = cats.map((c) => ({
          // on accepte à la fois { value, label } et { name, color, icon }
          id: (c._id || c.value || c.name || '').toString(),
          value: (c.value || c.name || '').toString(),
          label: (c.label ?? c.name ?? c.value ?? '').toString(),
          color:
            c.color ||
            this.categoryColors[c.value || c.name || 'event'] ||
            this.categoryColors['event']
        }));

        if (this.categories.length > 0) {
          this.form.patchValue({ category: this.categories[0].id });
        }
        this.cdr.detectChanges();
      },
      error: () => {
        // en cas d'erreur, on laisse la liste vide
      }
    });

    this.refreshEvents();
  }

  private refreshEvents(): void {
    this.eventsLoadError = '';

    this.eventService.getEvents().pipe(timeout(8000)).subscribe({
      next: (events) => {
        this.events = (events || []).map((e) => this.mapEntityToCalendarEvent(e));
        this.cdr.detectChanges();
      },
      error: (err) => {
        // On ne vide pas la liste si on avait déjà des données: meilleure UX lors du changement de section.
        if (err?.name === 'TimeoutError') {
          this.eventsLoadError = "Chargement trop long (timeout). Vérifie que le backend est démarré.";
        } else {
          this.eventsLoadError = "Impossible de charger les événements.";
        }
        console.error('Erreur chargement événements:', err);
      }
    });
  }

  private toYmd(isoDate: string | null | undefined): string {
    if (!isoDate) return '';
    // isoDate vient de Mongo/Express -> ISO string. On garde uniquement YYYY-MM-DD.
    return isoDate.length >= 10 ? isoDate.slice(0, 10) : isoDate;
  }

  private mapEntityToCalendarEvent(entity: EventEntity): CalendarEvent {
    const categoryValue = (entity.category?.value || entity.category?.name || 'event').toString();
    const date = this.toYmd(entity.started_date);
    const endDate = this.toYmd(entity.end_date ?? entity.started_date);

    return {
      id: entity._id,
      title: entity.title,
      date,
      endDate,
      published: Boolean(entity.published),
      category: categoryValue,
      description: entity.description ?? undefined,
      time: entity.all_day ? undefined : (entity.start_time ?? undefined),
      endTime: entity.all_day ? undefined : (entity.end_time ?? undefined)
    };
  }

  publishEvent(event: CalendarEvent): void {
    if (!event?.id) return;

    const newStatus = true;

    this.eventService.updateEvent(event.id, { published: newStatus }).subscribe({
      next: (updated) => {
        const mapped = this.mapEntityToCalendarEvent(updated);
        this.events = this.events.map(ev => (ev.id === mapped.id ? mapped : ev));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur mise à jour de l'état publié:", err);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.getRawValue();

    this.isSubmitting = true;

    this.eventService.createEvent({
      title: formValue.title,
      description: formValue.description,
      startDate: formValue.startDate,
      endDate: formValue.endDate || undefined,
      allDay: formValue.allDay,
      startTime: formValue.allDay ? undefined : (formValue.startTime || undefined),
      endTime: formValue.allDay ? undefined : (formValue.endTime || undefined),
      category: formValue.category,
      image: this.imagePreview || undefined
    }).subscribe({
      next: (created) => {
        const ev = this.mapEntityToCalendarEvent(created);
        this.events = [ev, ...this.events];
        this.form.reset({ category: 'event', allDay: true });
        this.selectedFile = null;
        this.imagePreview = null;
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur création événement:', err);
        this.isSubmitting = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return; // 5 Mo max
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  }

  getCategoryColor(category?: string): string {
    const found = this.categories.find(c => c.value === category);
    return found?.color || this.hashToColor((category || 'event').toString());
  }

  private hashToColor(value: string): string {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 55%)`;
  }

  formatDateRange(event: CalendarEvent): string {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(date);
    };
    
    if (event.endDate && event.date !== event.endDate) {
      return `${formatDate(event.date)} → ${formatDate(event.endDate)}`;
    }
    return formatDate(event.date);
  }
}
