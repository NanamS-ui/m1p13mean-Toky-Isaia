import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  error = '';
  success = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  submitting = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.nonNullable.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+261|0)[0-9]{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: [this.passwordMatchValidator]
    });
  }

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate([this.auth.getRedirectRoute()]);
    }
  }

  /** Vérifie que les mots de passe correspondent */
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }

  /** Vérifie la force du mot de passe */
  get passwordStrength(): { level: string; label: string; percent: number } {
    const password = this.form.get('password')?.value || '';
    if (!password) return { level: '', label: '', percent: 0 };

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 'weak', label: 'Faible', percent: 20 };
    if (score <= 2) return { level: 'fair', label: 'Moyen', percent: 40 };
    if (score <= 3) return { level: 'good', label: 'Bon', percent: 65 };
    if (score <= 4) return { level: 'strong', label: 'Fort', percent: 85 };
    return { level: 'excellent', label: 'Excellent', percent: 100 };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error = '';
    this.submitting.set(true);

    // Simulation d'un appel API (délai de 1.5s)
    setTimeout(() => {
      this.submitting.set(false);
      this.success.set(true);

      // Redirection vers login après 2s
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2500);
    }, 1500);
  }
}
