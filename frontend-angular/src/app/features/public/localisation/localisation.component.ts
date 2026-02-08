import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FloorPlan {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-localisation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './localisation.component.html',
  styleUrl: './localisation.component.css'
})
export class LocalisationComponent {
  selectedFloor = signal<string>('floor-1');

  floorPlans = signal<FloorPlan[]>([
    { id: 'floor-1', name: 'Rez-de-chaussée', description: 'Boutiques, restaurants, accueil' },
    { id: 'floor-2', name: '1er étage', description: 'Mode, beauté, high-tech' },
    { id: 'floor-3', name: '2ème étage', description: 'Loisirs, services, espace enfants' }
  ]);

  address = {
    street: 'Ankorondrano',
    city: 'Antananarivo 101',
    country: 'Madagascar',
    full: 'Ankorondrano, Antananarivo 101, Madagascar'
  };

  contact = {
    phone: '+261 20 22 123 45',
    email: 'contact@korus.mg'
  };

  openingHours = [
    { day: 'Lundi - Samedi', hours: '09h00 - 21h00' },
    { day: 'Dimanche', hours: '10h00 - 20h00' },
    { day: 'Jours fériés', hours: '10h00 - 18h00' }
  ];

  accessInfo = {
    parking: '2000 places de parking disponibles, 2h gratuites',
    transport: [
      'Bus ligne 1, 3, 5 - Arrêt Ankorondrano',
      'Taxi-brousse - Station à 200m',
      'Navettes gratuites depuis le centre-ville'
    ]
  };

  selectFloor(floorId: string): void {
    this.selectedFloor.set(floorId);
  }
}
