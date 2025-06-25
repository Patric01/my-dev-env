import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: 'login.component.html',
  styleUrl: 'login.component.css'
})
export class LoginComponent {

  email: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService, private http: HttpClient) { }

  onLogin() {
  const payload = { email: this.email };
  this.errorMessage = '';

  this.http.post<any>('https://localhost:8000/login', payload).subscribe({
    next: (response) => {
      this.authService.storeToken(response.access_token);
      this.router.navigate(['/home']);
    },
    error: (err) => {
      if (err.status === 400 || err.status === 401) {
        this.errorMessage = err.error.detail || 'Email invalid sau utilizator inexistent.';
      } else {
        this.errorMessage = 'Eroare de server. Încearcă mai târziu.';
      }
    }
  });
}

}
