import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RoleRow {
  id: string;
  name: string;
  description: string;
  permissionsCount: number;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent {
  roles: RoleRow[] = [
    { id: '1', name: 'Admin', description: 'Accès complet centre commercial', permissionsCount: 24 },
    { id: '2', name: 'Boutique', description: 'Gestion de sa boutique et ventes', permissionsCount: 12 },
    { id: '3', name: 'Acheteur', description: 'Parcours achat et profil', permissionsCount: 6 }
  ];
}
