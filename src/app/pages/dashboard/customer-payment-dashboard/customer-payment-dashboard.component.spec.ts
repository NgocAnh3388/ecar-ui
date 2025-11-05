import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPaymentDashboardComponent } from './customer-payment-dashboard.component';

describe('CustomerPaymentDashboardComponent', () => {
  let component: CustomerPaymentDashboardComponent;
  let fixture: ComponentFixture<CustomerPaymentDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerPaymentDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerPaymentDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
