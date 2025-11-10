import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { AuthService } from '../../../../services/auth.service';
import { AuthPageLayoutComponent } from '../../../layout/auth-page-layout/auth-page-layout.component'; // ✅ layout đúng tên

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    AuthPageLayoutComponent // ✅ layout đúng tên
  ],
  templateUrl: './signup-form.component.html',
})
export class SignupFormComponent {
  email = '';
  password = '';
  confirmPassword = '';
  role = '';
  agree = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  /** ✅ Xử lý đăng ký người dùng (FE mode) */
  onSignUp(): void {
    if (!this.email || !this.password || !this.confirmPassword || !this.role) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Mật khẩu nhập lại không khớp!');
      return;
    }

    if (!this.agree) {
      alert('Bạn cần đồng ý với điều khoản sử dụng!');
      return;
    }

    const newUser = {
      email: this.email,
      password: this.password,
      role: this.role.toUpperCase(),
    };

    this.auth.register(newUser).subscribe({
      next: () => {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        // ✅ Điều hướng đúng route (có dấu gạch)
        this.router.navigate(['/sign-in']);
      },
      error: (err) => {
        alert(err.message || 'Đăng ký thất bại! Email đã tồn tại.');
      },
    });
  }

  /** 🟢 Đăng ký bằng Google (backend thật, chưa dùng ở FE mode) */
  signUpWithGoogle(): void {
    this.auth.loginWithGoogle();
  }
}
