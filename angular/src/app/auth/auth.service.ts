import { Injectable } from "@angular/core";
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: "root" })
export class AuthService {
  getToken(): string | null {
    return localStorage.getItem("token");
  }
  storeToken(token: string): void {
    localStorage.setItem("token", token);
  }

  logout(): void {
    localStorage.removeItem("token");
    window.location.href = "/";
  }
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  }
}
