import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceCenterService } from '../../../../core/services/config/service-center.service';
import type { ServiceCenterConfig } from '../../../../core/models/config/service-center.model';

@Component({
  selector: 'app-service-center-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-center-config.component.html',
  styleUrl: './service-center-config.component.css'
})
export class ServiceCenterConfigComponent implements OnInit {
  configs: ServiceCenterConfig[] = [];
  loading = false;
  error: string | null = null;
  editingId: string | null = null;

  form!: FormGroup;

  constructor(private fb: FormBuilder, private serviceCenter: ServiceCenterService) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      value: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });
    this.loadConfigs();
  }

  loadConfigs(): void {
    this.loading = true;
    this.error = null;
    this.serviceCenter.getAll().subscribe({
      next: (items: ServiceCenterConfig[]) => {
        this.configs = items || [];
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Erreur de chargement des configurations';
        this.loading = false;
      }
    });
  }

  startCreate(): void {
    this.editingId = null;
    this.form.reset({ value: '', description: '' });
  }

  startEdit(item: ServiceCenterConfig): void {
    this.editingId = item._id;
    this.form.reset({
      value: item.value,
      description: item.description || ''
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form.reset({ value: '', description: '' });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    this.loading = true;
    this.error = null;

    const request = this.editingId
      ? this.serviceCenter.update(this.editingId, payload)
      : this.serviceCenter.create(payload);

    request.subscribe({
      next: () => {
        this.loadConfigs();
        this.cancelEdit();
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Erreur lors de la sauvegarde';
        this.loading = false;
      }
    });
  }

  remove(item: ServiceCenterConfig): void {
    if (!confirm(`Supprimer la configuration "${item.value}" ?`)) return;
    this.loading = true;
    this.error = null;
    this.serviceCenter.delete(item._id).subscribe({
      next: () => this.loadConfigs(),
      error: (err: any) => {
        this.error = err?.error?.message || 'Erreur lors de la suppression';
        this.loading = false;
      }
    });
  }
}
