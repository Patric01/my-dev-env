import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Tournament {
  id: number;
  name: string;
  game: string;
  date: string;
  participants: string[];
  maxPlayers: number;
  started: boolean;
  status: 'inscrieri' | 'in-progress' | 'completed';
  image: string; // adăugăm imagine pentru afișare
}

@Component({
  selector: 'app-tournament-mainpg',
  standalone: false,
  templateUrl: './tournament-mainpg.component.html',
  styleUrls: ['./tournament-mainpg.component.css'],
  
})
export class TournamentMainpgComponent {
  selectedFilter: string = 'all';

  tournaments: Tournament[] = [
    {
      id: 1,
      name: 'Turneu Ping-Pong Aprilie',
      game: 'Ping-Pong',
      date: '2025-04-15',
      participants: ['Alice', 'Bob'],
      maxPlayers: 8,
      started: false,
      status: 'inscrieri',
      image: 'assets/pingpong.png'
    },
    {
      id: 2,
      name: 'FIFA Masters',
      game: 'FIFA',
      date: '2025-05-10',
      participants: ['Dan', 'John'],
      maxPlayers: 16,
      started: true,
      status: 'in-progress',
      image: 'assets/fifa.jpg'
    },
    {
      id: 3,
      name: 'Fussball Summer Cup',
      game: 'Fussball',
      date: '2025-06-20',
      participants: ['Eva', 'Max', 'Lucas'],
      maxPlayers: 12,
      started: true,
      status: 'completed',
      image: 'assets/fussball.jpg'
    },
    {
      id: 4,
      name: 'Mortal Kombat Showdown',
      game: 'Mortal Kombat',
      date: '2025-07-01',
      participants: ['Scorpion', 'Sub-Zero'],
      maxPlayers: 10,
      started: false,
      status: 'inscrieri',
      image: 'assets/mk.jpg'
    }
  ];

  get filteredTournaments(): Tournament[] {
    if (this.selectedFilter === 'all') return this.tournaments;
    return this.tournaments.filter(t => t.game.toLowerCase().includes(this.selectedFilter));
  }
}
