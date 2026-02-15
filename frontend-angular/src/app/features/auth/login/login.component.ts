import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { finalize, timeout, catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  error = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Si déjà connecté, rediriger vers l'espace correspondant
    if (this.auth.isAuthenticated()) {
      this.router.navigate([this.auth.getRedirectRoute()]);
    }
  }

  onSubmit(): void {
    if (this.isLoading) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error = '';
    this.isLoading = true;
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).pipe(
      timeout(5000),
      catchError((err) => {
        if (err?.name === 'TimeoutError') {
          this.error = "La connexion est trop lente. Veuillez réessayer.";
        } else {
          this.error = err?.error?.message || 'Email ou mot de passe incorrect.';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (user) => {
        if (user) {
          this.router.navigate([this.auth.getRedirectRoute()]);
        }
      }
    });
  }
}
