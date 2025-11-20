import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject, tap, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private api = 'http://localhost:8080';
    private userKey = 'user';

    // BehaviorSubject để lưu user hiện tại
    private currentUserSubject = new BehaviorSubject<any>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {
        const savedUser = localStorage.getItem(this.userKey);
        if (savedUser && savedUser !== '{}') {
            this.currentUserSubject.next(JSON.parse(savedUser));
        }
    }

    // Đăng nhập Google
    loginWithGoogle(): void {
        window.location.href = `${this.api}/oauth2/authorization/google`;
    }

    // Đăng xuất
    logout(): void {
        this.currentUserSubject.next(null);
        localStorage.removeItem(this.userKey);

        this.http.get(`${this.api}/logout`, { withCredentials: true }).subscribe({
            next: () => {
                console.log('Logout thành công');
                window.location.href = '/index';
            },
            error: (err) => {
                console.error('Lỗi khi logout:', err);
                window.location.href = '/index';
            },
        });
    }

    // Lấy thông tin user từ API và lưu vào cache + localStorage
    getCurrentUser(): Observable<any> {
        return this.http.get(`${this.api}/api/me`, { withCredentials: true }).pipe(
            tap((user: any) => {
                if (user && user.roles) {
                    this.currentUserSubject.next(user);
                    localStorage.setItem(this.userKey, JSON.stringify(user));
                } else {
                    this.currentUserSubject.next(null);
                    localStorage.removeItem(this.userKey);
                }
            }),
            catchError(() => {
                this.currentUserSubject.next(null);
                localStorage.removeItem(this.userKey);
                return of(null);
            })
        );
    }

    // Lấy user cache hoặc null
    getUser(): any {
        return this.currentUserSubject.value;
    }

    getRoles(): string[] {
        const user = this.getUser();
        return user?.roles || [];
    }

    hasRole(role: string): boolean {
        return this.getRoles().includes(role);
    }

    navigateToDashboard(): void {
        const roles = this.getRoles();
        if (roles.includes('ROLE_ADMIN')) this.router.navigate(['/users']);
        else if (roles.includes('ROLE_STAFF') || roles.includes('ROLE_TECHNICIAN')) this.router.navigate(['/service-dashboard']);
        else if (roles.includes('ROLE_CUSTOMER')) this.router.navigate(['/profile/me']);
        else this.router.navigate(['/index']);
    }
}
