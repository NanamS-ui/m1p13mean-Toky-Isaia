import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-loyers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './loyers.component.html',
  styleUrl: './loyers.component.css'
})
export class LoyersComponent {
  loyers = [
    { boutique: 'TechZone', monthlyRent: 850000, paidUntil: '2025-02-28', status: 'ok' },
    { boutique: 'Fashion House', monthlyRent: 620000, paidUntil: '2025-03-15', status: 'ok' },
    { boutique: 'Beauté & Soins', monthlyRent: 380000, paidUntil: '2025-01-31', status: 'due' }
  ];
}
