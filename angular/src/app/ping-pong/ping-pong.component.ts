import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { backend_url_base } from '../constants';
import { AuthService } from '../auth/auth.service';


interface ReservationBlock {
  id: number;
  user: string;
  start: string;
  end: string;
  top: number;
  height: number;
  mine: boolean;
  date: string;
  guests?: { name: string; email: string; status: string }[]; // ✅ adăugat
}

@Component({
  selector: 'app-ping-pong',
  standalone: false,
  templateUrl: './ping-pong.component.html',
  styleUrls: ['./ping-pong.component.css']
})


export class PingPongComponent implements OnInit {
  hours: string[] = Array.from({ length: 15 }, (_, i) => `${8 + i}:00`);
  blocks: ReservationBlock[] = [];
  currentUserName: string | null = null;
  durations = [15, 30, 45, 60];
  selectedDuration = 15;
  selectedStart = '';
  showToast = false;
  hoverStart: string = '';
  hoverEnd: string = '';
  hoverTop: number = 0;
  hoverVisible: boolean = false;
  modalVisible = false;
  modalStart = '';
  modalEnd = '';
  slots: { time: string }[] = [];
  selectedReservation: ReservationBlock | null = null;
  users: { id: number, name: string, email: string }[] = [];
  invitedUserId: number | null = null;
  reservationDetailsVisible = false;
  currentUserEmail: string | null = null;


  constructor(private http: HttpClient, private authService: AuthService) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserName = user?.name || null;
    this.currentUserEmail = user?.email || null;
    this.loadReservations();

  }

  pad(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }


  getReservationsFromDB(): void {
    this.http.get<any[]>(backend_url_base + 'reservations?type=ping-pong').subscribe({
      next: (data) => {
        data.forEach(res => {
          const startIndex = this.slots.findIndex(s => s.time === res.start_time.slice(11, 16));
          const endIndex = this.slots.findIndex(s => s.time === res.end_time.slice(11, 16));
          // const blockColor = this.getRandomColor();
        });
      }
    });
  }

  getHourFromOffset(offsetY: number): string {
    const totalMinutes = Math.floor(offsetY);  // 1px = 1min
    const hours = Math.floor(totalMinutes / 60) + 8; // începe la 08:00
    const minutes = totalMinutes % 60;

    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${pad(hours)}:${pad(minutes)}`;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ro-RO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  loadReservations(): void {
    const todayStr = new Date().toISOString().split('T')[0];

    this.http.get<any[]>(backend_url_base + 'reservations?type=ping-pong').subscribe(data => {
      this.blocks = data
        .filter(res => res.start_time.startsWith(todayStr))  // ✅ doar rezervări din ziua curentă
        .map(res => {
          const start = new Date(res.start_time);
          const end = new Date(res.end_time);
          const minutesFrom8AM = (start.getHours() - 8) * 60 + start.getMinutes();
          const durationMinutes = (end.getTime() - start.getTime()) / 60000;

          return {
            id: res.id,
            user: res.user_name,
            start: res.start_time.slice(11, 16),
            end: res.end_time.slice(11, 16),
            date: res.start_time.slice(0, 10),
            top: minutesFrom8AM,
            height: durationMinutes,
            mine: res.user_name === this.currentUserName,
            guests: res.guests || []
          };
        });
    });
  }


  isOverlapping(start: Date, end: Date): boolean {
    return this.blocks.some(block => {
      const blockStart = new Date();
      const [sh, sm] = block.start.split(':').map(Number);
      blockStart.setHours(sh, sm, 0);

      const blockEnd = new Date();
      const [eh, em] = block.end.split(':').map(Number);
      blockEnd.setHours(eh, em, 0);

      return !(end <= blockStart || start >= blockEnd);
    });
  }

  confirmReservation(): void {
    if (!this.selectedStart) return;

    const [h, m] = this.selectedStart.split(':').map(Number);
    const start = new Date();
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + this.selectedDuration * 60000);

    // 💥 Verificare pentru limită 22:00
    const maxEnd = new Date();
    maxEnd.setHours(22, 0, 0, 0);
    if (end.getTime() > maxEnd.getTime()) {
      alert("Rezervările nu pot depăși ora 22:00.");
      this.modalVisible = false;
      return;
    }

    if (this.isOverlapping(start, end)) {
      alert('Intervalul selectat se suprapune cu o rezervare existentă.');
      this.modalVisible = false;
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const payload = {
      type: 'ping-pong',
      start_time: `${today}T${this.pad(h)}:${this.pad(m)}:00`,
      end_time: `${today}T${this.pad(end.getHours())}:${this.pad(end.getMinutes())}:00`,
      max_guests: 3
    };

    // <<<<<<< Updated upstream
    //     console.log('Payload trimis:', payload);


    //     this.http.post(backend_url_base + 'reservations', payload)
    //       .subscribe({
    //         next: () => {
    //           this.selectedSlots.forEach((slot, index) => {
    //             slot.user = name;
    //             slot.blockStart = index === 0;
    //             slot.blockColor = blockColor;
    //             slot.selected = false;
    //             if (index === 0) slot.guests = [];
    //           });

    //           this.modalVisible = false;
    //           this.selectedSlots = [];
    //           this.showToast = true;
    //           setTimeout(() => this.showToast = false, 3000);
    //         },
    //         error: (err) => {
    //           console.error('Eroare la salvare rezervare:', err);
    //           alert('A apărut o eroare la salvarea rezervării.');
    //         }
    //       });


    this.http.post(backend_url_base + 'reservations', payload).subscribe({
      next: () => {
        this.showToast = true;
        this.modalVisible = false;
        setTimeout(() => this.showToast = false, 3000);
        this.selectedStart = '';
        this.loadReservations();
      },
      error: () => alert('Eroare la salvarea rezervării.')
    });

  }


  handleHover(event: MouseEvent): void {
    const y = event.offsetY;
    const start = this.getHourFromOffset(y);
    const [h, m] = start.split(':').map(Number);

    const startTime = new Date();
    startTime.setHours(h, m, 0);
    const endTime = new Date(startTime.getTime() + this.selectedDuration * 60000);

    const endStr = `${this.pad(endTime.getHours())}:${this.pad(endTime.getMinutes())}`;

    const conflict = this.blocks.some(b => !(b.end <= start || b.start >= endStr));
    if (conflict) {
      this.hoverVisible = false;
      return;
    }

    this.hoverStart = start;
    this.hoverEnd = endStr;
    this.hoverTop = y;
    this.hoverVisible = true;
  }



  selectSlot(hour: string): void {
    this.selectedStart = hour;
  }


  openModal(start: string): void {
    const [h, m] = start.split(':').map(Number);

    const startDate = new Date();
    startDate.setHours(h, m, 0, 0);

    const endDate = new Date(startDate.getTime() + this.selectedDuration * 60000);

    this.modalStart = `${this.pad(startDate.getHours())}:${this.pad(startDate.getMinutes())}`;
    this.modalEnd = `${this.pad(endDate.getHours())}:${this.pad(endDate.getMinutes())}`;
    this.selectedStart = this.modalStart;
    this.modalVisible = true;
  }


  closeModal(): void {
    this.modalVisible = false;
  }


  openReservationDetails(block: ReservationBlock): void {
    this.selectedReservation = block;
    this.reservationDetailsVisible = true;
    this.fetchUsers();
    this.fetchGuests(block.id);
  }

  fetchGuests(reservationId: number): void {
    this.http.get<any[]>(`${backend_url_base}reservations/${reservationId}/guests`)
      .subscribe(data => {
        if (this.selectedReservation) {
          this.selectedReservation.guests = data.map(g => ({
            id: g.user_id,
            name: g.user_name,
            email: g.user_email,
            status: g.status // pending / accepted / declined
          }));
        }
      });
  }


  openDetails(block: ReservationBlock, event: MouseEvent): void {
    event.stopPropagation();

    if (!block.mine) return;  // 👈 nu deschide dacă nu e a ta

    this.selectedReservation = block;
    this.reservationDetailsVisible = true;
    this.fetchUsers();
    this.fetchGuests(block.id); // ✅ Adaugă asta!
  }


  fetchUsers(): void {
    this.http.get<any[]>(`${backend_url_base}users/search?q=`).subscribe(data => {
      this.users = data;
    });
  }

  inviteGuest(): void {
    if (!this.selectedReservation || !this.invitedUserId) return;

    this.http.post(`${backend_url_base}reservations/${this.selectedReservation.id}/invite`, {
      guest_ids: [this.invitedUserId]
    }).subscribe({
      next: () => {
        alert('Invitat cu succes!');
        this.invitedUserId = null;
        this.fetchGuests(this.selectedReservation!.id);  // ✅ reîncarcă lista de invitați
      },
      error: () => alert('Nu poti invita un jucator de mai multe ori.')
    });
    this.fetchGuests(this.selectedReservation!.id); // după invitare


  }

  respondToInvite(accept: boolean): void {
    if (!this.selectedReservation) return;
    const status = accept ? 'accepted' : 'declined';

    this.http.post(`${backend_url_base}reservations/${this.selectedReservation.id}/respond`, {
      status
    }).subscribe({
      next: () => {
        alert(`Ai ${accept ? 'acceptat' : 'refuzat'} invitația.`);
        this.fetchGuests(this.selectedReservation!.id);
      },
      error: () => alert('Eroare la trimiterea răspunsului.')
    });
  }

  respondToInvitation(reservationId: number, response: 'accepted' | 'declined'): void {
    this.http.post(`${backend_url_base}reservations/${reservationId}/respond`, { response }).subscribe({
      next: () => {
        alert('Răspunsul a fost trimis cu succes.');
        this.loadReservations();
      },
      error: () => alert('Eroare la trimiterea răspunsului.')
    });
  }

  isCurrentUserInvited(): boolean {
    return this.selectedReservation?.guests?.some(g => g.email === this.currentUserEmail) ?? false;
  }

  get isMaxGuestsReached(): boolean {
    return (this.selectedReservation?.guests?.length || 0) >= 3;
  }

  isUserAlreadyInvited(email: string): boolean {
    return this.selectedReservation?.guests?.some(g => g.email === email) ?? false;
  }

  logout(): void {
    this.authService.logout();
    this.currentUserName = null;
  }
}
