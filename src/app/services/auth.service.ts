import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private api = 'http://localhost:8080';

    constructor(private http: HttpClient, private router: Router) {}

    // Đăng nhập Google
    loginWithGoogle() {
        window.location.href = `${this.api}/oauth2/authorization/google`;
    }

    // Đăng xuất
    logout() {
        localStorage.removeItem('user');
        this.http.get(`${this.api}/logout`, { withCredentials: true }).subscribe({
            next: () => {
                console.log('Logout thành công');
                // Dùng window.location để đảm bảo tải lại trang và xóa sạch trạng thái
                window.location.href = '/index';
            },
            error: (err) => {
                console.error('Lỗi khi logout:', err);
                window.location.href = '/index'; // Vẫn quay lại login nếu lỗi
            },
        });
    }

    // Lấy thông tin user hiện tại
    getCurrentUser(): Observable<any> {
        return this.http.get(`${this.api}/api/me`, { withCredentials: true }).pipe(
            tap((user: any) => {
                localStorage.setItem('user', JSON.stringify(user));
            })
        );
    }

    // Lấy user từ localStorage (Đã cải tiến)
    getUser(): any {
        const userStr = localStorage.getItem('user');
        // Trả về null nếu không có user, thay vì '{}'
        if (userStr && userStr !== '{}') {
            return JSON.parse(userStr);
        }
        return null;
    }

    // Lấy danh sách roles
    getRoles(): string[] {
        const user = this.getUser();
        return user?.roles || [];
    }

    // Kiểm tra role có tồn tại
    hasRole(role: string): boolean {
        return this.getRoles().includes(role);
    }

    // === HÀM QUAN TRỌNG ĐỂ PHÂN QUYỀN DASHBOARD ===
    /**
     * Tự động điều hướng người dùng đến dashboard chính xác
     * dựa trên role của họ.
     */
    navigateToDashboard(): void {
        const roles = this.getRoles();

        if (roles.includes('ROLE_ADMIN')) {
            this.router.navigate(['/users']); // Dashboard của Admin
        } else if (roles.includes('ROLE_STAFF') || roles.includes('ROLE_TECHNICIAN')) {
            this.router.navigate(['/service-dashboard']); // Dashboard của Staff/Tech
        } else if (roles.includes('ROLE_CUSTOMER')) {
            this.router.navigate(['/profile/me']); // Dashboard của Customer
        } else {
            // Fallback nếu có user nhưng không có role
            this.router.navigate(['/']);
        }
    }
}