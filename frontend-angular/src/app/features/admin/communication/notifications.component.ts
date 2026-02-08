import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      title: ['', Validators.required],
      message: ['', Validators.required],
      channel: ['push', Validators.required], // push | email
      target: ['all'] // all | acheteurs | boutiques
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    console.log('Notification envoyée:', this.form.getRawValue());
  }
}
