import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private router: Router) {}

  onLogin() {
    // Aici poți adăuga verificări reale dacă ai backend
    this.router.navigate(['/home']);
  }
}
