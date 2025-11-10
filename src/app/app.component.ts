import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    title = 'Ecar Service';

    constructor(private authService: AuthService, private router: Router) {}

    ngOnInit(): void {
        const currentUrl = this.router.url;

        // Bỏ qua auto-redirect nếu đang ở trang PayPal callback
        if (currentUrl.includes('/paypal/success') || currentUrl.includes('/paypal/cancel')) {
            console.log('Bỏ qua redirect vì đang ở PayPal callback:', currentUrl);
            return;
        }

        // Thực hiện kiểm tra session và điều hướng
        this.authService.getCurrentUser().subscribe({
            next: (user: any) => {
                // Nếu gọi API thành công -> người dùng đã đăng nhập
                console.log('Session is valid for user:', user.email);

                if (!user || !user.roles) {
                    // Nếu user không có roles, có thể là một trạng thái lạ, đưa về trang chủ
                    if (!['/', '/index'].includes(currentUrl)) {
                        this.router.navigate(['/index']); // Sửa lại thành /index nếu đó là trang chủ của em
                    }
                    return;
                }

                const roles: string[] = user.roles;
                const isAuthPage = ['/', '/index', '/login', '/signup'].some(path => currentUrl.startsWith(path));

                // Chỉ tự động điều hướng nếu user đang ở các trang công khai
                if (isAuthPage) {
                    if (roles.includes('ROLE_ADMIN')) {
                        this.router.navigate(['/admin/dashboard']); // Sửa thành trang dashboard của Admin
                    } else if (roles.includes('ROLE_STAFF')) {
                        this.router.navigate(['/staff/dashboard']); // Sửa thành trang dashboard của Staff
                    } else if (roles.includes('ROLE_TECHNICIAN')) {
                        this.router.navigate(['/technician/dashboard']); // Sửa thành trang dashboard của Technician
                    } else if (roles.includes('ROLE_CUSTOMER')) {
                        this.router.navigate(['/customer/dashboard']); // Sửa thành trang dashboard của Customer
                    } else {
                        this.router.navigate(['/']); // Mặc định về trang chủ
                    }
                }
            },
            error: () => {
                // Nếu gọi API thất bại (401), nghĩa là chưa đăng nhập
                console.log('User is not logged in.');
                // Không cần làm gì cả, để người dùng tự do duyệt các trang công khai
            },
        });
    }
}