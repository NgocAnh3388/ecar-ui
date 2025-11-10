import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../../services/auth.service';
import { AuthPageLayoutComponent } from '../../../layout/auth-page-layout/auth-page-layout.component';

@Component({
  selector: 'app-signin-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AuthPageLayoutComponent // ✅ dùng đúng layout thực tế
  ],
  templateUrl: './signin-form.component.html',
})
export class SigninFormComponent {
  showPassword = false;
  email = '';
  password = '';
  isChecked = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  /** 🔹 Hiện / ẩn mật khẩu */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /** ✅ Xử lý đăng nhập và điều hướng đúng theo role */
  onSignIn(): void {
    if (!this.email || !this.password) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    this.auth.login(this.email, this.password).subscribe({
      next: (user: any) => {
        const role = (user?.role || user?.roles?.[0] || 'CUSTOMER').toUpperCase();

        console.log('Đăng nhập thành công:', user);
        console.log('→ Role xác định:', role);

        // ✅ Điều hướng theo quyền
        switch (role) {
          case 'ADMIN':
            this.router.navigate(['/admin-dashboard']);
            break;
          case 'STAFF':
            this.router.navigate(['/service-dashboard']);
            break;
          case 'CUSTOMER':
            this.router.navigate(['/customer-payment-dashboard']);
            break;
          default:
            this.router.navigate(['/index']);
            break;
        }
      },
      error: (err: any) => {
        alert(err.message || 'Sai tài khoản hoặc mật khẩu!');
      },
    });
  }

  /** 🟢 Đăng nhập bằng Google (backend thật) */
  loginWithGoogle(): void {
    this.auth.loginWithGoogle();
  }
}
