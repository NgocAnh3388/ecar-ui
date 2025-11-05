import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceDetailDialogComponent } from './service-detail-dialog.component';

describe('ServiceDetailDialogComponent', () => {
  let component: ServiceDetailDialogComponent;
  let fixture: ComponentFixture<ServiceDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
