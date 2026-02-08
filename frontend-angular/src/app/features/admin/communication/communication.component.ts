import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarComponent, type CalendarEvent } from './calendar/calendar.component';

@Component({
  selector: 'app-communication',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CalendarComponent],
  templateUrl: './communication.component.html',
  styleUrl: './communication.component.css'
})
export class CommunicationComponent {
  form: FormGroup;
  
  categories = [
    { value: 'event', label: 'Événement', color: '#8b5cf6' },
    { value: 'promo', label: 'Promotion', color: '#f59e0b' },
    { value: 'meeting', label: 'Réunion', color: '#3b82f6' },
    { value: 'reminder', label: 'Rappel', color: '#10b981' }
  ];

  events: CalendarEvent[] = [
    { 
      id: '1', 
      title: 'Soldes d\'été KORUS', 
      date: '2026-02-01', 
      endDate: '2026-02-15', 
      published: true,
      category: 'promo',
      description: 'Grandes soldes sur toutes les collections'
    },
    { 
      id: '2', 
      title: 'Soirée Mode & Musique', 
      date: '2026-02-20', 
      endDate: '2026-02-20', 
      published: false,
      category: 'event',
      time: '19:00',
      endTime: '23:00',
      description: 'Défilé de mode avec DJ set'
    },
    { 
      id: '3', 
      title: 'Animation du weekend', 
      date: '2026-01-31', 
      endDate: '2026-02-01', 
      published: true,
      category: 'event',
      time: '14:00'
    },
    { 
      id: '4', 
      title: 'Réunion équipe marketing', 
      date: '2026-01-29', 
      published: true,
      category: 'meeting',
      time: '10:00',
      endTime: '11:30',
      description: 'Point mensuel sur les campagnes'
    },
    { 
      id: '5', 
      title: 'Lancement nouvelle collection', 
      date: '2026-02-10', 
      published: false,
      category: 'event',
      time: '18:00',
      description: 'Présentation de la collection printemps'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      title: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      startTime: [''],
      endTime: [''],
      category: ['event'],
      allDay: [true]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    
    const formValue = this.form.getRawValue();
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: formValue.title,
      date: formValue.startDate,
      endDate: formValue.endDate || formValue.startDate,
      published: false,
      category: formValue.category,
      description: formValue.description,
      time: formValue.allDay ? undefined : formValue.startTime,
      endTime: formValue.allDay ? undefined : formValue.endTime
    };
    
    this.events = [...this.events, newEvent];
    this.form.reset({ category: 'event', allDay: true });
    console.log('Annonce/événement créé:', newEvent);
  }

  getCategoryColor(category?: string): string {
    const found = this.categories.find(c => c.value === category);
    return found?.color || '#8b5cf6';
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
