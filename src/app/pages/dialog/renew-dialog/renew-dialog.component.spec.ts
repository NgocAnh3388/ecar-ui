import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewDialogComponent } from './renew-dialog.component';

describe('RenewDialogComponent', () => {
  let component: RenewDialogComponent;
  let fixture: ComponentFixture<RenewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenewDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
