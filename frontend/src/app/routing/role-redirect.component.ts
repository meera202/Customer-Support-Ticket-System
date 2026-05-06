import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  template: '',
})
export class RoleRedirectComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user?.role === 'agent') {
      void this.router.navigate(['/app/agent/dashboard'], { replaceUrl: true });
    } else {
      void this.router.navigate(['/app/customer/dashboard'], { replaceUrl: true });
    }
  }
}
