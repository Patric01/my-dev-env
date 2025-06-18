import { Component, OnInit } from '@angular/core';

interface Slot {
  time: string;
  user: string | null;
  blockStart?: boolean;
  blockColor?: string;
  guests?: string[];
}

@Component({
  selector: 'app-playstation',
  standalone: false,
  templateUrl: './playstation.component.html',
  styleUrl: './playstation.component.css'
})
export class PlaystationComponent implements OnInit {
  slots: Slot[] = [];
  durations = [15, 30, 45, 60];
  selectedDuration = 30;
  currentUser: string | null = null;
  openLobbySlot: Slot | null = null;
  guestName = '';
  maxGuests = 1;

  ngOnInit(): void {
    this.generateSlots();
    this.loadBookings();
    this.currentUser = localStorage.getItem('playstation-user');
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
    let name = this.currentUser;
    if (!name) {
      name = prompt('Numele tău:');
      if (!name) return;
      this.currentUser = name.trim();
      localStorage.setItem('playstation-user', this.currentUser);
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
      slot.user = this.currentUser;
      slot.blockStart = i === 0;
      slot.blockColor = blockColor;
      if (i === 0) slot.guests = [];
    }

    this.saveBookings();
  }

  openLobby(time: string): void {
    const slot = this.slots.find(s => s.time === time);
    if (slot && slot.user === this.currentUser) {
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
    localStorage.setItem('playstation-bookings', JSON.stringify(this.slots));
  }

  loadBookings(): void {
    const data = localStorage.getItem('playstation-bookings');
    if (data) {
      const saved: Slot[] = JSON.parse(data);
      this.slots = saved;
    }
  }

  logout(): void {
    localStorage.removeItem('playstation-user');
    this.currentUser = null;
  }
}
