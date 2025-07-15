import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { backend_url_base } from './constants';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showNavbar = true;
  notifications: any[] = [];
  showNotifications = false;

  constructor(private router: Router, private authService: AuthService, private http: HttpClient) {
    // Ascultă schimbările de rută
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Ascunde navbar-ul doar pe ruta login ("/")
        this.showNavbar = event.urlAfterRedirects !== '/';
      }
    });
  }

 ngOnInit(): void {
  const user = this.authService.getCurrentUser();
  if (user) {
    this.getNotifications();
  }
}


 getNotifications() {
  this.http.get<any[]>(backend_url_base + 'notifications').subscribe({
    next: (data) => {
      console.log('Notificări:', data);  // 👈 vezi ce primești
      this.notifications = data;
    },
    error: (err) => {
      console.error('Eroare la notificări:', err);  // 👈 vezi dacă e 401, 500 etc
    }
  });
}


  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }


  respondToInvite(reservationId: number, accept: boolean) {
  const status = accept ? 'accepted' : 'declined';

  this.http.post(`${backend_url_base}reservations/${reservationId}/respond`, { status }).subscribe({
    next: () => {
      // elimină invitația din listă
      this.notifications = this.notifications.filter(n => n.id !== reservationId);
    },
    error: () => {
      alert('Eroare la trimiterea răspunsului.');
    }
  });
}

  logout() {
    this.authService.logout();
  }
}
