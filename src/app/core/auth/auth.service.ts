import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();
  
  private readonly isAuthenticatedSignal = signal<boolean>(false);
  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  constructor(private router: Router) {
    this.checkInitialAuth();
  }

  private checkInitialAuth() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Mock validating token and setting user
      this.currentUserSignal.set({ id: '1', name: 'Mahesh Morde', email: 'mahesh@example.com', role: 'user' });
      this.isAuthenticatedSignal.set(true);
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    // Mock API call
    return new Promise(resolve => {
      setTimeout(() => {
        if (email === 'test@test.com' && password === 'password') {
          localStorage.setItem('auth_token', 'mock_jwt_token_123');
          this.currentUserSignal.set({ id: '1', name: 'Mahesh Morde', email: email, role: 'user' });
          this.isAuthenticatedSignal.set(true);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/auth/login']);
  }
}
