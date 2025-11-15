import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

export interface AuthRequest {
  Username: string;
  Password: string;
}

export interface AuthResponse {
  token: string; // se espera un Bearer token en la respuesta
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authUrl = 'https://backcvbgtmdesa.azurewebsites.net/api/login/authenticate';
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_username';
  private currentUser?: string;

  constructor(private http: HttpClient) {
    // Restaurar usuario desde storage si existe (permite refrescar la página)
    const stored = localStorage.getItem(this.userKey);
    if (stored) this.currentUser = stored;
  }

  login(usernameOrEmail: string, password: string): Observable<string> {
    const username = this.normalizeUsername(usernameOrEmail);
    const body: AuthRequest = { Username: username, Password: password };
    return this.http.post<AuthResponse | { Token?: string; token?: string }>(this.authUrl, body).pipe(
      map((res: any) => res?.token ?? res?.Token ?? ''),
      tap((token) => {
        if (token) {
          this.setToken(token);
          this.setUser(username);
        }
      })
    );
  }

  normalizeUsername(input: string): string {
    const at = input.indexOf('@');
    return at > 0 ? input.slice(0, at) : input;
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser = undefined;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUser(): string | undefined {
    if (this.currentUser) return this.currentUser;
    const stored = localStorage.getItem(this.userKey) || undefined;
    this.currentUser = stored || this.currentUser;
    return this.currentUser;
  }

  private setUser(username: string): void {
    this.currentUser = username;
    localStorage.setItem(this.userKey, username);
  }
}
