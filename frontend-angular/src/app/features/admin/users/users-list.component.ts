import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { UserStatus } from '../../../core/models/user.model';
import { AdminUsersService, type AdminUserForGestionAdmin } from '../../../core/services/user/admin-users.service';

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
export class UsersListComponent implements OnInit {
  private adminUsersService = inject(AdminUsersService);

  filterStatus: UserStatus | '' = '';
  filterRole: string = '';

  isLoading = false;
  error: string | null = null;

  users: UserRow[] = [];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;

    this.adminUsersService.getUsersForGestionAdmin().subscribe({
      next: (data) => {
        this.users = (Array.isArray(data) ? data : []).map((u) => this.mapAdminUserToRow(u));
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message || 'Erreur lors du chargement des utilisateurs.';
        console.error('Erreur chargement users (gestion admin):', err);
      }
    });
  }

  exportExcel(): void {
    const filename = 'utilisateurs.xlsx';
    this.adminUsersService.exportUsersExcel().subscribe({
      next: (blob) => this.saveBlob(blob, filename),
      error: (err) => {
        console.error('Erreur export Excel utilisateurs:', err);
      }
    });
  }

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

  private mapAdminUserToRow(u: AdminUserForGestionAdmin): UserRow {
    const fullName = String(u?.name || '').trim();
    const nameParts = fullName ? fullName.split(' ') : [];
    const firstName = nameParts.shift() || '';
    const lastName = nameParts.join(' ');

    const role = String(u?.role?.val || '').trim() || 'ACHETEUR';

    const status = this.mapBackendStatusToUiStatus(u);
    const createdAt = this.formatDateLocal(u?.created_at);

    return {
      id: String(u?._id || ''),
      email: String(u?.email || ''),
      firstName,
      lastName,
      role,
      status,
      createdAt
    };
  }

  private mapBackendStatusToUiStatus(u: AdminUserForGestionAdmin): UserStatus {
    if (u?.isSuspended) return 'SUSPENDED';

    const value = String(u?.status?.value || '').toLowerCase();
    if (value.includes('bloq')) return 'BLOCKED';
    if (value.includes('attent')) return 'PENDING';
    if (value.includes('suspend')) return 'SUSPENDED';
    if (value.includes('actif')) return 'ACTIVE';

    return 'ACTIVE';
  }

  private formatDateLocal(dateValue: string | undefined): string {
    if (!dateValue) return '';
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return String(dateValue);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private saveBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}
