import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showNavbar = true;

  constructor(private router: Router) {
    // Ascultă schimbările de rută
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Ascunde navbar-ul doar pe ruta login ("/")
        this.showNavbar = event.urlAfterRedirects !== '/';
      }
    });
  }
}
