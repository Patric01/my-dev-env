import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentMainpgComponent } from './tournament-mainpg.component';

describe('TournamentMainpgComponent', () => {
  let component: TournamentMainpgComponent;
  let fixture: ComponentFixture<TournamentMainpgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TournamentMainpgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentMainpgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
