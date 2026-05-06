import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type UserRole = 'customer' | 'agent';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

const STORAGE_KEY = 'cst_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = '/api/auth';

  private readonly userSignal = signal<AuthUser | null>(null);
  private token: string | null = null;

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.token && !!this.userSignal());

  constructor(private readonly http: HttpClient) {
    this.restoreSession();
  }

  register(
    username: string,
    password: string,
    role: UserRole
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, { username, password, role })
      .pipe(tap((res) => this.persistSession(res)));
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { username, password })
      .pipe(tap((res) => this.persistSession(res)));
  }

  logout(): void {
    this.token = null;
    this.userSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): AuthUser | null {
    return this.userSignal();
  }

  private persistSession(res: AuthResponse): void {
    this.token = res.token;
    this.userSignal.set(res.user);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: res.token, user: res.user })
    );
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as AuthResponse;
      if (parsed?.token && parsed?.user) {
        this.token = parsed.token;
        this.userSignal.set(parsed.user);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
