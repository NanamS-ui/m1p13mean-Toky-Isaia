import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InfoCenterService } from '../../../../core/services/config/info-center.service';
import type { InfoCenter, InfoCenterHour } from '../../../../core/models/config/info-center.model';

@Component({
  selector: 'app-info-center-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './info-center-config.component.html',
  styleUrl: './info-center-config.component.css'
})
export class InfoCenterConfigComponent implements OnInit {
  loading = false;
  error: string | null = null;
  infoId: string | null = null;

  form!: FormGroup;

  constructor(private fb: FormBuilder, private infoCenter: InfoCenterService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['KORUS Center', [Validators.required, Validators.minLength(2)]],
      hoursSummary: ['Lun-Sam: 09h-21h | Dim: 10h-20h'],
      address: this.fb.group({
        street: ['Ankorondrano'],
        city: ['Antananarivo 101'],
        country: ['Madagascar'],
        full: ['Ankorondrano, Antananarivo 101, Madagascar']
      }),
      contact: this.fb.group({
        phone: ['+261 20 22 123 45'],
        email: ['contact@korus.mg', [Validators.email]]
      }),
      openingHours: this.fb.array([this.createHourGroup({ day: 'Lundi - Samedi', hours: '09h00 - 21h00' })]),
      footerHours: this.fb.array([
        this.createHourGroup({ day: 'Lundi - Vendredi', hours: '09:00 - 21:00' }),
        this.createHourGroup({ day: 'Samedi', hours: '09:00 - 22:00' }),
        this.createHourGroup({ day: 'Dimanche', hours: '10:00 - 20:00' })
      ]),
      parkingInfo: ['2000 places de parking disponibles, 2h gratuites'],
      transportInfo: this.fb.array([this.fb.control('Bus ligne 1, 3, 5 - Arret Ankorondrano')])
    });

    this.loadInfo();
    this.cdr.detectChanges();
  }

  get openingHoursArray(): FormArray {
    return this.form.get('openingHours') as FormArray;
  }

  get footerHoursArray(): FormArray {
    return this.form.get('footerHours') as FormArray;
  }

  get transportArray(): FormArray {
    return this.form.get('transportInfo') as FormArray;
  }

  addOpeningHour(): void {
    this.openingHoursArray.push(this.createHourGroup({ day: '', hours: '' }));
  }

  removeOpeningHour(index: number): void {
    if (this.openingHoursArray.length <= 1) return;
    this.openingHoursArray.removeAt(index);
  }

  addFooterHour(): void {
    this.footerHoursArray.push(this.createHourGroup({ day: '', hours: '' }));
  }

  removeFooterHour(index: number): void {
    if (this.footerHoursArray.length <= 1) return;
    this.footerHoursArray.removeAt(index);
  }

  addTransport(): void {
    this.transportArray.push(this.fb.control(''));
  }

  removeTransport(index: number): void {
    if (this.transportArray.length <= 1) return;
    this.transportArray.removeAt(index);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue() as InfoCenter;
    this.loading = true;
    this.error = null;

    const request = this.infoId
      ? this.infoCenter.update(this.infoId, payload)
      : this.infoCenter.create(payload);

    request.subscribe({
      next: (saved) => {
        this.infoId = saved?._id || this.infoId;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Erreur lors de la sauvegarde';
        this.loading = false;
      }
    });
  }

  private loadInfo(): void {
    this.loading = true;
    this.infoCenter.getAll().subscribe({
      next: (items: InfoCenter[]) => {
        const info = items?.[0];
        if (info) {
          this.infoId = info._id;
          this.patchForm(info);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private patchForm(info: InfoCenter): void {
    this.form.patchValue({
      name: info.name || '',
      hoursSummary: info.hoursSummary || '',
      address: {
        street: info.address?.street || '',
        city: info.address?.city || '',
        country: info.address?.country || '',
        full: info.address?.full || ''
      },
      contact: {
        phone: info.contact?.phone || '',
        email: info.contact?.email || ''
      },
      parkingInfo: info.parkingInfo || ''
    });

    this.replaceHoursArray(this.openingHoursArray, info.openingHours);
    this.replaceHoursArray(this.footerHoursArray, info.footerHours);
    this.replaceTransportArray(info.transportInfo);
  }

  private replaceHoursArray(target: FormArray, items?: InfoCenterHour[]): void {
    target.clear();
    const rows = items?.length ? items : [{ day: '', hours: '' }];
    rows.forEach(row => target.push(this.createHourGroup(row)));
  }

  private replaceTransportArray(items?: string[]): void {
    this.transportArray.clear();
    const rows = items?.length ? items : [''];
    rows.forEach(row => this.transportArray.push(this.fb.control(row)));
  }

  private createHourGroup(row: InfoCenterHour): FormGroup {
    return this.fb.group({
      day: [row.day, Validators.required],
      hours: [row.hours, Validators.required]
    });
  }
}
