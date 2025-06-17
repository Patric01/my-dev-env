
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private storageKey = 'user-email';

  login(email: string): void {
    localStorage.setItem(this.storageKey, email);
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.storageKey);
  }

  getUserEmail(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  getCurrentUser(): string | null {
    const email = this.getUserEmail();
    if (!email) return null;
    const namePart = email.split('@')[0];
    const firstName = namePart.split('.')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  }
}
