import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
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

  constructor(private router: Router, private authService: AuthService,private http: HttpClient) {}

  onLogin() {
    const payload = { email: this.email };
    this.errorMessage = ''; // resetăm mesajul anterior

    this.http.post<any>('http://localhost:8000/login', payload)
      .subscribe({
        next: (response) => {
          console.log('Token JWT:', response.access_token);
          localStorage.setItem('token', response.access_token);
          // TODO: redirect către /home sau altă pagină
          this.router.navigate(['/home']); // 🔹 REDIRECT aici
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
