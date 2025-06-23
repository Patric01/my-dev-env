import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';

interface Slot {
  time: string;
  user: string | null;
  blockStart?: boolean;
  blockColor?: string;
  guests?: string[];
}

@Component({
  selector: 'app-ping-pong',
  standalone: false,
  templateUrl: './ping-pong.component.html',
  styleUrl: './ping-pong.component.css'
})
export class PingPongComponent implements OnInit {
  slots: Slot[] = [];
  durations = [15, 30, 45, 60];
  selectedDuration = 30;
  currentUserName: string | null = null;

  openLobbySlot: Slot | null = null;
  guestName = '';
  maxGuests = 3;

  constructor(private authService: AuthService, private http: HttpClient) { }

  ngOnInit(): void {
    this.currentUserName = this.authService.getCurrentUser()['name'];
    this.generateSlots();
    this.loadBookings();


    // use this data instead of the hardcoded values
    // you'll also probably want to make a new method called `getReservations` or similar
    // and call it wherever instead of repeating the same code
    this.http.get('https://localhost:8000/reservations?type=ping-pong')
      .subscribe({
        next: data => {
          console.log(data)
        }
      })
  }

  getRandomColor(): string {
    const colors = ['#FFE0E6', '#E0F7FF', '#E8FFE0', '#FFF4E0'];
    return colors[Math.floor(Math.random() * colors.length)];
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

  reserve(startTime: string): void {
    if (!this.currentUserName) {
      alert('Trebuie să fii autentificat!');
      return;
    }

    const startIndex = this.slots.findIndex(slot => slot.time === startTime);
    if (startIndex === -1) return;

    const slotsToReserve = this.selectedDuration / 15;
    const blockColor = this.getRandomColor();

    for (let i = 0; i < slotsToReserve; i++) {
      const slot = this.slots[startIndex + i];
      if (!slot || slot.user) {
        alert('Interval indisponibil.');
        return;
      }
    }

    for (let i = 0; i < slotsToReserve; i++) {
      const slot = this.slots[startIndex + i];
      slot.user = this.currentUserName;
      slot.blockStart = i === 0;
      slot.blockColor = blockColor;
      if (i === 0) slot.guests = [];
    }

    this.saveBookings();
  }


  openLobby(time: string): void {
    const slot = this.slots.find(s => s.time === time);
    if (slot && slot.user === this.currentUserName) {
      if (!slot.guests) slot.guests = [];
      this.openLobbySlot = slot;
    }
  }

  closeLobby(): void {
    this.openLobbySlot = null;
    this.guestName = '';
  }

  addGuest(): void {
    if (
      this.openLobbySlot &&
      this.guestName.trim() &&
      (this.openLobbySlot.guests?.length || 0) < this.maxGuests
    ) {
      this.openLobbySlot.guests!.push(this.guestName.trim());
      this.guestName = '';
      this.saveBookings();
    }
  }


  saveBookings(): void {
    localStorage.setItem('pingpong-bookings', JSON.stringify(this.slots));
  }

  loadBookings(): void {
    const data = localStorage.getItem('pingpong-bookings');
    if (data) {
      const saved: Slot[] = JSON.parse(data);
      this.slots = saved;
    }
  }
  logout(): void {
    this.authService.logout();
    this.currentUserName = null;
  }
}
