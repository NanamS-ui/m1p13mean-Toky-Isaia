import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { UserStatus } from '../../../core/models/user.model';

interface UserRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: UserStatus;
  createdAt: string;
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent {
  filterStatus: UserStatus | '' = '';
  filterRole: string = '';

  users: UserRow[] = [
    { id: '1', email: 'jean.rabe@email.mg', firstName: 'Jean', lastName: 'Rabe', role: 'ACHETEUR', status: 'ACTIVE', createdAt: '2024-11-15' },
    { id: '2', email: 'marie.ranaivo@email.mg', firstName: 'Marie', lastName: 'Ranaivo', role: 'ACHETEUR', status: 'ACTIVE', createdAt: '2024-12-01' },
    { id: '3', email: 'contact@techzone.mg', firstName: 'Tech', lastName: 'Zone', role: 'BOUTIQUE', status: 'ACTIVE', createdAt: '2024-10-20' },
    { id: '4', email: 'suspected@email.mg', firstName: 'User', lastName: 'Suspended', role: 'ACHETEUR', status: 'SUSPENDED', createdAt: '2024-09-10' }
  ];

  get filteredUsers(): UserRow[] {
    return this.users.filter(u => {
      const matchStatus = !this.filterStatus || u.status === this.filterStatus;
      const matchRole = !this.filterRole || u.role === this.filterRole;
      return matchStatus && matchRole;
    });
  }

  getStatusLabel(s: UserStatus): string {
    const map: Record<UserStatus, string> = { ACTIVE: 'Actif', SUSPENDED: 'Suspendu', BLOCKED: 'Bloqué', PENDING: 'En attente' };
    return map[s] ?? s;
  }

  getRoleLabel(r: string): string {
    const map: Record<string, string> = { ADMIN: 'Admin', BOUTIQUE: 'Boutique', ACHETEUR: 'Acheteur' };
    return map[r] ?? r;
  }
}
