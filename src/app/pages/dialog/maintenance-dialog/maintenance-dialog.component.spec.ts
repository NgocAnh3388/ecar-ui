import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceDialogComponent } from './maintenance-dialog.component';

describe('MaintenanceDialogComponent', () => {
  let component: MaintenanceDialogComponent;
  let fixture: ComponentFixture<MaintenanceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
