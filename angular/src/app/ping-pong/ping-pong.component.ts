import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { backend_url_base } from '../constants';

interface Slot {
  time: string;
  user: string | null;
  blockStart?: boolean;
  blockColor?: string;
  guests?: string[];
  selected?: boolean;
}

@Component({
  selector: 'app-ping-pong',
  standalone: false,
  templateUrl: './ping-pong.component.html',
  styleUrls: ['./ping-pong.component.css']
})
export class PingPongComponent implements OnInit {
  slots: Slot[] = [];
  currentUserName: string | null = null;
  availableUsers: string[] = []; // nume utilizatori
  showToast = false;
  selectedSlots: Slot[] = [];
  isSelecting = false;
  modalVisible = false;
  selectedStart = '';
  selectedEnd = '';

  constructor(private authService: AuthService, private http: HttpClient) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserName = user?.name || null;
    this.generateSlots();
    this.getReservationsFromDB();

  }

  generateSlots(): void {
    const startHour = 10;
    const endHour = 18;
    const interval = 15;
    const slots: Slot[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += interval) {
        const time = `${this.pad(hour)}:${this.pad(min)}`;
        slots.push({ time, user: null });
      }
    }

    this.slots = slots;
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
          const blockColor = this.getRandomColor();

          for (let i = startIndex; i < endIndex; i++) {
            if (this.slots[i]) {
              this.slots[i].user = res.user_name;
              this.slots[i].blockStart = i === startIndex;
              this.slots[i].blockColor = blockColor;
            }
          }
        });
      },
      error: (err) => {
        console.error('Eroare la preluarea rezervărilor:', err);
      }
    });
  }

  getRandomColor(): string {
    const colors = ['#FFE0E6', '#E0F7FF', '#E8FFE0', '#FFF4E0'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  startSelecting(slot: Slot): void {
    if (slot.user) return;
    this.isSelecting = true;
    this.clearSelection();
    slot.selected = true;
    this.selectedSlots = [slot];
  }

  hoverSelecting(slot: Slot): void {
    if (!this.isSelecting || slot.user) return;
    if (!this.selectedSlots.includes(slot)) {
      slot.selected = true;
      this.selectedSlots.push(slot);
    }
  }

  endSelecting(): void {
    if (this.selectedSlots.length) {
      this.selectedStart = this.selectedSlots[0].time;
      this.selectedEnd = this.selectedSlots[this.selectedSlots.length - 1].time;
      this.modalVisible = true;
    }
    this.isSelecting = false;
  }


  confirmReservation(): void {
    const name = this.currentUserName;
    const blockColor = this.getRandomColor();

    const today = new Date().toISOString().split('T')[0];

    // Adaugă ":00" la final pentru a avea HH:mm:ss
    const startTime = `${today}T${this.selectedStart}:00`;
    const endTime = `${today}T${this.selectedEnd}:00`;

    const payload = {
      type: 'ping-pong',
      start_time: startTime,
      end_time: endTime
    };

    console.log('Payload trimis:', payload);


    this.http.post(backend_url_base + 'reservations', payload)
      .subscribe({
        next: () => {
          this.selectedSlots.forEach((slot, index) => {
            slot.user = name;
            slot.blockStart = index === 0;
            slot.blockColor = blockColor;
            slot.selected = false;
            if (index === 0) slot.guests = [];
          });

          this.modalVisible = false;
          this.selectedSlots = [];
          this.showToast = true;
          setTimeout(() => this.showToast = false, 3000);
        },
        error: (err) => {
          console.error('Eroare la salvare rezervare:', err);
          alert('A apărut o eroare la salvarea rezervării.');
        }
      });

  }


  cancelSelection(): void {
    this.selectedSlots.forEach((slot) => (slot.selected = false));
    this.modalVisible = false;
    this.selectedSlots = [];
  }

  clearSelection(): void {
    this.slots.forEach((slot) => (slot.selected = false));
    this.selectedSlots = [];
  }

  logout(): void {
    this.authService.logout();
    this.currentUserName = null;
  }
}