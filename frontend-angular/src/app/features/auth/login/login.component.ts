import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
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

  // Comptes de démo pour affichage
  demoAccounts = [
    { label: 'Admin', email: 'admin@korus.mg', password: 'admin123', icon: 'admin_panel_settings', color: '#ef4444' },
    { label: 'Boutique', email: 'boutique@korus.mg', password: 'boutique123', icon: 'storefront', color: '#f59e0b' },
    { label: 'Acheteur', email: 'acheteur@korus.mg', password: 'acheteur123', icon: 'shopping_bag', color: '#3b82f6' }
  ];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
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

  /** Rempli le formulaire avec un compte de démo */
  fillDemo(email: string, password: string): void {
    this.form.patchValue({ email, password });
    this.error = '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error = '';
    const { email, password } = this.form.getRawValue();
    if (this.auth.login(email, password)) {
      // Redirection automatique selon le rôle
      this.router.navigate([this.auth.getRedirectRoute()]);
    } else {
      this.error = 'Email ou mot de passe incorrect.';
    }
  }
}
