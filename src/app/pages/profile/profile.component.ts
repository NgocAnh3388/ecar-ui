import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UserMetaCardComponent } from '../../shared/components/user-profile/user-meta-card/user-meta-card.component';
import { UserInfoCardComponent } from '../../shared/components/user-profile/user-info-card/user-info-card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    UserMetaCardComponent,
    UserInfoCardComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userId!: number;
  userData: User = new User({ vehicles: [] });
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    const roles = this.authService.getRoles();

    // 👨‍💼 Nếu là admin → lấy id từ URL để xem profile của khách hàng
    if (roles.includes('ADMIN')) {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.userId = +id;
          this.loadUser(this.userId);
        } else {
          // Nếu admin vào mà không có id -> không load gì cả
          this.isLoading = false;
        }
      });
    }
    // 👤 Nếu là customer → tự xem profile của chính mình
    else {
      if (currentUser && currentUser.id) {
        this.userId = currentUser.id;
        this.loadUser(this.userId);
      } else {
        // Nếu localStorage trống -> gọi API /api/me để lấy lại
        this.userService.me().subscribe({
          next: (user: any) => {
            this.userId = user.id;
            localStorage.setItem('user', JSON.stringify(user));
            this.loadUser(this.userId);
          },
          error: (err) => {
            console.error('Không thể tải thông tin người dùng:', err);
            this.isLoading = false;
          }
        });
      }
    }
  }

  loadUser(id: number) {
    this.isLoading = true;
    this.userService.getUserById(id).subscribe({
      next: (user: User) => {
        this.userData = user;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}
