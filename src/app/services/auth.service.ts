import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:8080'; // URL backend thật (Spring Boot)
  private USERS_KEY = 'local_users';     // Danh sách user FE tạm
  private CURRENT_USER_KEY = 'user';     // User hiện tại đang đăng nhập

  /** ⚙️ false = FE mode (hiện tại), true = BE mode (khi kết nối backend) */
  private useBackend = false;

  constructor(private http: HttpClient) {}

  // ============================================================
  // 🔹 GOOGLE LOGIN — luôn gọi BE thật
  // ============================================================
  loginWithGoogle(): void {
    window.location.href = `${this.api}/oauth2/authorization/google`;
  }

  // ============================================================
  // 🔹 LOGOUT — chỉ điều hướng, KHÔNG xóa người dùng
  // ============================================================
  logout(): void {
    // Giữ lại thông tin user trong localStorage
    // Không remove(CURRENT_USER_KEY)
    window.location.href = '/index';
  }

  // ============================================================
  // 🔹 REGISTER (Đăng ký)
  // ============================================================
  register(user: any): Observable<any> {
    if (!this.useBackend) {
      // ✅ FE MODE
      const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
      if (users.find((u: any) => u.email === user.email)) {
        return throwError(() => new Error('Email đã tồn tại!'));
      }
      users.push(user);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      return of(user);
    }

    // 🟢 BE MODE
    /*
    return this.http.post(`${this.api}/api/auth/register`, user).pipe(
      tap((res) => console.log('✅ Đăng ký thành công (BE):', res))
    );
    */
    return of(null);
  }

  // ============================================================
  // 🔹 LOGIN (Đăng nhập)
  // ============================================================
  login(email: string, password: string): Observable<any> {
    if (!this.useBackend) {
      // ✅ FE MODE
      const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
      const found = users.find(
        (u: any) => u.email === email && u.password === password
      );
      if (!found) {
        return throwError(() => new Error('Sai tài khoản hoặc mật khẩu!'));
      }
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(found));
      return of(found);
    }

    // 🟢 BE MODE
    /*
    return this.http.post(`${this.api}/api/auth/login`, { email, password }).pipe(
      tap((user: any) => {
        console.log('✅ Đăng nhập thành công (BE):', user);
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      })
    );
    */
    return of(null);
  }

  // ============================================================
  // 🔹 LẤY USER HIỆN TẠI
  // ============================================================
  getCurrentUser(): Observable<any> {
    if (!this.useBackend) {
      const user = JSON.parse(localStorage.getItem(this.CURRENT_USER_KEY) || 'null');
      return of(user);
    }

    // 🟢 BE MODE
    /*
    return this.http.get(`${this.api}/api/me`, { withCredentials: true }).pipe(
      tap((user: any) => {
        console.log('👤 Thông tin người dùng (BE):', user);
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      })
    );
    */
    return of(null);
  }

  // ============================================================
  // 🔹 HÀM TIỆN ÍCH
  // ============================================================
  getUser(): any {
    return JSON.parse(localStorage.getItem(this.CURRENT_USER_KEY) || '{}');
  }

  getRoles(): string[] {
    const user = this.getUser();
    return user?.roles || [user?.role].filter(Boolean);
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }
}
