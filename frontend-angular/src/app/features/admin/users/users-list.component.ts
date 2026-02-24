import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormsModule,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { UserStatus } from '../../../core/models/user.model';
import {
  AdminUsersService,
  type AdminUserForGestionAdmin,
} from '../../../core/services/user/admin-users.service';
import { forkJoin } from 'rxjs';

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
  imports: [CommonModule, FormsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent implements OnInit {
  private adminUsersService = inject(AdminUsersService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  filterStatus: UserStatus | '' = '';
  filterRole: string = '';
  roles: any;
  status: any;
  isLoading = false;
  error: string | null = null;
  gestionUsers: any;
  selectedUser: any = null;
  actionType: 'suspend' | 'block' | null = null;
  actionForm!: FormGroup;

  users: UserRow[] = [];

  ngOnInit(): void {
    this.actionForm = this.fb.group({
      description: ['', Validators.required],
      end_date: [null, this.actionType === 'suspend' ? this.endDateAfterNowValidator() : []],
    });
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;
    forkJoin({
      data: this.adminUsersService.getUsersForGestionAdmin(),
      roles: this.adminUsersService.getUsersRoles(),
      status: this.adminUsersService.getUsersStatus(),
    }).subscribe({
      next: ({ data, roles, status }) => {
        this.gestionUsers = data;
        this.users = (Array.isArray(data) ? data : []).map((u) => this.mapAdminUserToRow(u));
        this.roles = roles;
        this.status = status;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message || 'Erreur lors du update des utilisateurs.';
        console.error('Erreur chargement users (gestion admin):', err);
      },
    });
  }
  endDateAfterNowValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null; // vide, pas de validation ici
      const selectedDate = new Date(value);
      const now = new Date();
      return selectedDate <= now ? { datePast: true } : null;
    };
  }
  private getSuspenduStatus(): any {
    for (let index = 0; index < this.status.length; index++) {
      if (this.status[index].value === 'Suspendu') return this.status[index];
    }
  }
  private getBloquerStatus(): any {
    for (let index = 0; index < this.status.length; index++) {
      if (this.status[index].value === 'Bloquer') return this.status[index];
    }
  }
  private getActifStatus(): any {
    for (let index = 0; index < this.status.length; index++) {
      if (this.status[index].value === 'Actif') return this.status[index];
    }
  }

  openSuspendForm(user: any) {
    this.selectedUser = user;
    this.actionType = 'suspend';

    this.actionForm.reset();
  }

  openBlockForm(user: any) {
    this.selectedUser = user;
    this.actionType = 'block';

    this.actionForm.reset();
  }

  closeModal() {
    this.selectedUser = null;
    this.actionType = null;
  }
  submitAction() {
    if (this.actionForm.invalid) return;
    if (this.actionType === 'suspend' && this.actionForm.value.end_date) {
      const endDate = new Date(this.actionForm.value.end_date);
      const now = new Date();
      if (endDate <= now) {
        alert('La date de fin doit être supérieure à maintenant !');
        return; // stop submit
      }
    }

    const payload = {
      description: this.actionForm.value.description,
      end_date: this.actionType === 'suspend' ? this.actionForm.value.end_date : null,
    };
    forkJoin({
      data: this.adminUsersService.addSuspension(this.selectedUser._id, payload),
      roles: this.adminUsersService.updateUsers(this.selectedUser._id, {
        status:
          this.actionType === 'suspend'
            ? this.getSuspenduStatus()._id
            : this.getBloquerStatus()._id,
      }),
    }).subscribe({
      next: ({ data, roles }) => {
        this.gestionUsers = this.gestionUsers.map((r: any) =>
          r._id === this.selectedUser?._id
            ? {
                ...r,
                status:
                  this.actionType === 'suspend'
                    ? this.getSuspenduStatus()
                    : this.getBloquerStatus(),
              }
            : r
        );
        this.closeModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message || 'Erreur lors du chargement des utilisateurs.';
        console.error('Erreur update users (gestion admin):', err);
      },
    });
  }
  reactiverUser(user: any) {
    this.adminUsersService.reactiverUser(user._id).subscribe({
      next: () => {
        this.gestionUsers = this.gestionUsers.map((r: any) =>
          r._id === user._id ? { ...r, status: this.getActifStatus() } : r
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message || 'Erreur lors du chargement des utilisateurs.';
        console.error('Erreur update users (gestion admin):', err);
      },
    });
  }

  exportExcel(): void {
    const filename = 'utilisateurs.xlsx';
    this.adminUsersService.exportUsersExcel().subscribe({
      next: (blob) => this.saveBlob(blob, filename),
      error: (err) => {
        console.error('Erreur export Excel utilisateurs:', err);
      },
    });
  }

  get filteredUsers(): any[] {
    return (this.gestionUsers ?? []).filter((u: any) => {
      const matchStatus = !this.filterStatus || u.status?._id === this.filterStatus;
      const matchRole = !this.filterRole || u.role?._id === this.filterRole;
      return matchStatus && matchRole;
    });
  }

  getStatusLabel(s: string): string {
    const map: Record<string, string> = {
      Actif: 'active',
      Suspendu: 'suspended',
      Bloquer: 'blocked',
    };
    return map[s] ?? s;
  }

  getRoleLabel(r: string): string {
    const map: Record<string, string> = {
      ADMIN: 'Admin',
      BOUTIQUE: 'Boutique',
      ACHETEUR: 'Acheteur',
    };
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
      createdAt,
    };
  }

  private mapBackendStatusToUiStatus(u: AdminUserForGestionAdmin): UserStatus {
    if (u?.isSuspended) return 'SUSPENDED';

    const value = String(u?.status?.value || '').toLowerCase();
    if (value.includes('bloq')) return 'BLOCKED';
    if (value.includes('attente')) return 'PENDING';
    if (value.includes('suspend')) return 'SUSPENDED';
    if (value.includes('actif')) return 'ACTIVE';

    return 'ACTIVE';
  }

  formatDateLocal(dateValue: string | undefined): string {
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
