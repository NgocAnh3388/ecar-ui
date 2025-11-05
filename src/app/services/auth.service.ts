import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // 🔹 Đăng nhập Google
  loginWithGoogle() {
    window.location.href = `${this.api}/oauth2/authorization/google`;
  }

  // 🔹 Đăng xuất
  logout() {
    localStorage.removeItem('user');
    window.location.href = `${this.api}/logout`;
  }

  // 🔹 Lấy thông tin user hiện tại
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.api}/api/me`, { withCredentials: true }).pipe(
      tap((user: any) => {
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  // 🔹 Lấy user từ localStorage
  getUser(): any {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  // 🔹 Lấy danh sách roles (mảng)
  getRoles(): string[] {
    const user = this.getUser();
    return user?.roles || [];
  }

  // 🔹 Kiểm tra role có tồn tại không
  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }
}
