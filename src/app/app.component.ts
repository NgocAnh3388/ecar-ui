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
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user && user.roles) {
          const roles: string[] = user.roles;

          if (roles.includes('ROLE_ADMIN')) {
            this.router.navigate(['/users']);
          } else if (roles.includes('ROLE_STAFF')) {
            this.router.navigate(['/service-dashboard']);
          } else if (roles.includes('ROLE_CUSTOMER')) {
            this.router.navigate(['/customer-dashboard']);
          } else if (roles.includes('ROLE_TECHNICIAN')) {
            this.router.navigate(['/service-dashboard']);
          } else {
            this.router.navigate(['/profile']);
          }
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => {
        console.warn('Không thể lấy thông tin user, chuyển về trang chủ.');
        this.router.navigate(['/']);
      },
    });
  }
}
