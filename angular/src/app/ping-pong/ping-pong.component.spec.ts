import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PingPongComponent } from './ping-pong.component';

describe('PingPongComponent', () => {
  let component: PingPongComponent;
  let fixture: ComponentFixture<PingPongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PingPongComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PingPongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
