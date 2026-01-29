import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BOUTIQUE_CATEGORIES } from '../../../core/models/boutique.model';

@Component({
  selector: 'app-boutique-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './boutique-form.component.html',
  styleUrl: './boutique-form.component.css'
})
export class BoutiqueFormComponent {
  categories = BOUTIQUE_CATEGORIES;
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      category: ['MODE', Validators.required],
      ownerEmail: ['', [Validators.required, Validators.email]],
      zone: [''],
      surfaceM2: [0, [Validators.required, Validators.min(1)]],
      monthlyRent: [0, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('Boutique créée:', this.form.getRawValue());
  }
}
