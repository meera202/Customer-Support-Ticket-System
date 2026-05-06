import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, UserRole } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  role: UserRole = 'customer';
  errorMessage = '';
  submitting = false;

  goLogin(): void {
    void this.router.navigate(['/login']);
  }

  submit(): void {
    this.errorMessage = '';
    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Enter username and password.';
      return;
    }
    this.submitting = true;
    this.auth.register(this.username.trim(), this.password, this.role).subscribe({
      next: () => {
        this.submitting = false;
        void this.router.navigate(['/app']);
      },
      error: (err: unknown) => {
        this.submitting = false;
        if (err instanceof HttpErrorResponse) {
          if (err.status === 0) {
            this.errorMessage =
              'Cannot reach auth service. In another terminal: cd backend\\auth-service && npm start (needs MongoDB).';
            return;
          }
          if (typeof err.error?.error === 'string') {
            this.errorMessage = err.error.error;
            return;
          }
          this.errorMessage = `Registration failed (HTTP ${err.status}).`;
          return;
        }
        this.errorMessage = 'Registration failed.';
      },
    });
  }
}
