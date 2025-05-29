import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FussballComponent } from './fussball.component';

describe('FussballComponent', () => {
  let component: FussballComponent;
  let fixture: ComponentFixture<FussballComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FussballComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FussballComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
