import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  ActivatedRoute,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly auth = inject(AuthService);

  protected readonly collapsed = signal(false);
  protected readonly pageTitle = signal('Overview');

  ngOnInit(): void {
    this.refreshTitle();
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.refreshTitle());
  }

  private refreshTitle(): void {
    let r = this.route;
    while (r.firstChild) {
      r = r.firstChild;
    }
    const t = r.snapshot.data['title'];
    this.pageTitle.set(typeof t === 'string' ? t : 'Overview');
  }

  protected toggleSidebar(): void {
    this.collapsed.update((v) => !v);
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
