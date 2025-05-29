import { Component } from '@angular/core';

interface Slot {
  time: string;
  user: string | null;
  blockStart?: boolean; // slot-ul de început
  blockColor?: string;  // culoare pentru grup
}

@Component({
  selector: 'app-fussball',
  standalone: false,
  templateUrl: './fussball.component.html',
  styleUrl: './fussball.component.css'
})
export class FussballComponent {
slots: Slot[] = [];
  durations = [15, 30, 45, 60];
  selectedDuration = 30;

  ngOnInit(): void {
    this.generateSlots();
    this.loadBookings();
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
  const name = prompt('Numele tău:');
  if (!name) return;

  const startIndex = this.slots.findIndex(slot => slot.time === startTime);
  if (startIndex === -1) return;

  const slotsToReserve = this.selectedDuration / 15;
  const blockColor = this.getRandomColor();

  // verificare dacă toate sunt libere
  for (let i = 0; i < slotsToReserve; i++) {
    const slot = this.slots[startIndex + i];
    if (!slot || slot.user) {
      alert('Interval indisponibil.');
      return;
    }
  }

  // rezervare efectivă
  for (let i = 0; i < slotsToReserve; i++) {
    const slot = this.slots[startIndex + i];
    slot.user = name.trim();
    slot.blockStart = i === 0;
    slot.blockColor = blockColor;
  }

  this.saveBookings();
}


  saveBookings(): void {
    localStorage.setItem('fussball-bookings', JSON.stringify(this.slots));
  }

  loadBookings(): void {
    const data = localStorage.getItem('fussball-bookings');
    if (data) {
      const saved = JSON.parse(data);
      this.slots = this.slots.map(slot => {
        const match = saved.find((s: Slot) => s.time === slot.time);
        return match ? match : slot;
      });
    }
  }
}
