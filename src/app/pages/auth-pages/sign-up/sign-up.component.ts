import { Component } from '@angular/core';
import { AuthPageLayoutComponent } from '../../../shared/layout/auth-page-layout/auth-page-layout.component';
import { SignupFormComponent } from '../../../shared/components/auth/signup-form/signup-form.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  // ✅ thêm CommonModule nếu HTML có các thẻ *ngIf, *ngFor
  imports: [
    AuthPageLayoutComponent,
    SignupFormComponent,
  ],
  templateUrl: './sign-up.component.html',
})
export class SignUpComponent {}
