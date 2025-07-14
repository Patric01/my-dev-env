import { Component } from '@angular/core';


interface Tournament {
  id: number;
  name: string;
  game: string; // ex: "Ping-Pong"
  date: string;
  participants: string[];
  maxPlayers: number;
  started: boolean;
  status: 'inscrieri' | 'in-progress' | 'completed';
}

@Component({
  selector: 'app-tournament-mainpg',
  standalone: false,
  templateUrl: './tournament-mainpg.component.html',
  styleUrl: './tournament-mainpg.component.css'
})
export class TournamentMainpgComponent {

}
