import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaypalSuccessComponent } from './paypal-success.component';

describe('PaypalSuccessComponent', () => {
  let component: PaypalSuccessComponent;
  let fixture: ComponentFixture<PaypalSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaypalSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaypalSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
