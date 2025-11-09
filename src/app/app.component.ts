import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Angular Ecommerce Dashboard | TailAdmin';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // ✅ Delay 1 nhịp để đảm bảo router.url có giá trị chính xác
    setTimeout(() => {
      const currentUrl = this.router.url;

      // ✅ Bỏ qua auto-redirect nếu đang ở trang PayPal callback
      if (currentUrl.includes('paypal/success') || currentUrl.includes('paypal/cancel')) {
        console.log('⏭ Bỏ qua redirect vì đang ở PayPal callback:', currentUrl);
        return;
      }

      // ✅ Thực hiện redirect theo role như cũ
      this.authService.getCurrentUser().subscribe({
        next: (user: any) => {
          if (!user || !user.roles) {
            this.router.navigate(['/index']);
            return;
          }

          const roles: string[] = user.roles;

          if (roles.includes('ROLE_ADMIN')) {
            this.router.navigate(['/']);
          } else if (roles.includes('ROLE_STAFF') || roles.includes('ROLE_TECHNICIAN')) {
            this.router.navigate(['/service-dashboard']);
          } else if (roles.includes('ROLE_CUSTOMER')) {
            this.router.navigate(['/profile/me']);
          } else {
            this.router.navigate(['/profile']);
          }
        },
        error: () => {
          console.warn('Không thể lấy thông tin user, chuyển về trang chủ.');
          this.router.navigate(['/index']);
        },
      });
    }, 0);
  }
}
