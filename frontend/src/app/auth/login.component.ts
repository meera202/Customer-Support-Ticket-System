import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  errorMessage = '';

  goRegister(): void {
    void this.router.navigate(['/register']);
  }

  submit(): void {
    this.errorMessage = '';
    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Enter username and password.';
      return;
    }
    this.auth.login(this.username.trim(), this.password).subscribe({
      next: () => void this.router.navigate(['/app']),
      error: (err: unknown) => {
        this.errorMessage = this.describeHttpError(
          err,
          'Login failed. Start auth-service (port 5001) and MongoDB, then try again.'
        );
      },
    });
  }

  private describeHttpError(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return 'Cannot reach auth service. In a second terminal run: cd backend\\auth-service && npm start';
      }
      if (typeof err.error?.error === 'string') {
        return err.error.error;
      }
      return `${fallback} (HTTP ${err.status})`;
    }
    return fallback;
  }
}
