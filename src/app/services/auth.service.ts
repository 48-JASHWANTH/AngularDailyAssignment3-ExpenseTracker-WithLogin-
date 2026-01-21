import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

interface User {
  id: number;
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private isAuthenticatedSignal = signal(false);
  private currentUserSignal = signal<string | null>(null);
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor(private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Check if user is already logged in (only in browser)
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.isAuthenticatedSignal.set(true);
        this.currentUserSignal.set(storedUser);
      }
    }
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.get<User[]>(`${this.apiUrl}?username=${username}`).pipe(
      map(users => {
        if (users.length > 0 && users[0].password === password) {
          this.isAuthenticatedSignal.set(true);
          this.currentUserSignal.set(username);
          if (this.isBrowser) {
            localStorage.setItem('currentUser', username);
          }
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  logout(): void {
    this.isAuthenticatedSignal.set(false);
    this.currentUserSignal.set(null);
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSignal();
  }

  getCurrentUser(): string | null {
    return this.currentUserSignal();
  }
}
