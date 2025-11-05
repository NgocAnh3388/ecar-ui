import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCarDialogComponent } from './create-car-dialog.component';

describe('CreateCarDialogComponent', () => {
  let component: CreateCarDialogComponent;
  let fixture: ComponentFixture<CreateCarDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCarDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
