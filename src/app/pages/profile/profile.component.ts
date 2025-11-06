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
  userId!: string;
  userData: User = new User({ vehicles: [] });
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const roles = this.authService.getRoles();

    if (roles.includes('ROLE_ADMIN')) {
      // Admin: lấy id từ URL
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.userId = id;
          this.loadUser(this.userId);
        }
      });
    } else {
      // Customer: gọi API /me
      this.userService.me().subscribe({
        next: (user) => {
          console.log('Customer profile user object:', user);
          this.userData = user;
          this.isLoading = false;
          localStorage.setItem('user', JSON.stringify(user));
        },
        error: (err) => {
          console.error('Không thể tải thông tin người dùng:', err);
          this.isLoading = false;
        }
      });
    }
  }

  // Chỉ giữ 1 method loadUser
  loadUser(id: string) {
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
