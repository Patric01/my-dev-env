import { Injectable } from "@angular/core";
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: "root" })
export class AuthService {
  getToken(): string | null {
    return localStorage.getItem("token");
  }

  logout(): void {
    localStorage.removeItem("token");
    // Navigate to login page if necessary
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
