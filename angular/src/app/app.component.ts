import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showNavbar = true;

  constructor(private router: Router, private authService: AuthService) {
    // Ascultă schimbările de rută
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Ascunde navbar-ul doar pe ruta login ("/")
        this.showNavbar = event.urlAfterRedirects !== '/';
      }
    });
  }
  logout() {
    this.authService.logout();
  }
}
