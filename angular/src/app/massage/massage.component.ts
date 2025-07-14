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
  date: string;  // ✅ nou
  guests?: { name: string; email: string; status: string }[];
}


@Component({
  selector: 'app-massage',
  standalone: false,
  templateUrl: './massage.component.html',
  styleUrls: ['./massage.component.css']
})

export class MassageComponent implements OnInit {
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
    this.http.get<any[]>(backend_url_base + 'reservations?type=massage').subscribe({
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
    const todayStr = new Date().toISOString().split('T')[0]; // e.g. "2025-07-09"

    this.http.get<any[]>(backend_url_base + 'reservations?type=massage').subscribe(data => {
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
      type: 'massage',
      start_time: `${today}T${this.pad(h)}:${this.pad(m)}:00`,
      end_time: `${today}T${this.pad(end.getHours())}:${this.pad(end.getMinutes())}:00`
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
  }


  openDetails(block: ReservationBlock, event: MouseEvent): void {
    event.stopPropagation();

    if (!block.mine) return;  // 👈 nu deschide dacă nu e a ta

    this.selectedReservation = block;
    this.reservationDetailsVisible = true;
    this.fetchUsers();
  }


  fetchUsers(): void {
    this.http.get<any[]>(`${backend_url_base}users/search?q=`).subscribe(data => {
      this.users = data;
    });
  }



  logout(): void {
    this.authService.logout();
    this.currentUserName = null;
  }
}
