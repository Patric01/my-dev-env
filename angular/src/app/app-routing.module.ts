import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { PingPongComponent } from './ping-pong/ping-pong.component';
import { PlaystationComponent } from './playstation/playstation.component';
import { FussballComponent } from './fussball/fussball.component';
import { MassageComponent } from './massage/massage.component';
import { TournamentMainpgComponent } from './tournament-mainpg/tournament-mainpg.component';

const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'ping-pong', component: PingPongComponent },
    { path: 'playstation', component: PlaystationComponent },
    { path: 'fussball', component: FussballComponent },
    { path: 'massage', component: MassageComponent },
    { path: 'tournament', component: TournamentMainpgComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
