import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Ticket {
  id: string;
  type: 'feedback' | 'reclamation';
  subject: string;
  userEmail: string;
  date: string;
  status: 'open' | 'in_progress' | 'closed';
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css'
})
export class SupportComponent {
  tickets: Ticket[] = [
    { id: '1', type: 'feedback', subject: 'Satisfaction générale', userEmail: 'jean@email.mg', date: '2025-01-28', status: 'closed' },
    { id: '2', type: 'reclamation', subject: 'Retard livraison commande #4521', userEmail: 'marie@email.mg', date: '2025-01-27', status: 'in_progress' },
    { id: '3', type: 'reclamation', subject: 'Produit défectueux', userEmail: 'user@email.mg', date: '2025-01-26', status: 'open' }
  ];
}
