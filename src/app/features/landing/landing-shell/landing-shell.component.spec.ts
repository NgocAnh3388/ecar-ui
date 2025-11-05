import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingShellComponent } from './landing-shell.component';

describe('LandingShellComponent', () => {
  let component: LandingShellComponent;
  let fixture: ComponentFixture<LandingShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingShellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
