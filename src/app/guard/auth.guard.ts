import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { Injectable } from '@angular/core';
import { catchError, Observable, map, of, tap } from 'rxjs';
import { UserService } from '../services/user.service';
import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService,
    private tokenStorageService: TokenStorageService,
    private auth: AuthService
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    // ✅ Ưu tiên kiểm tra user từ FE (localStorage)
    const localUser = this.auth.getUser();
    if (localUser && localUser.email) {
      // Lưu user vào token storage (đồng bộ)
      this.tokenStorageService.saveUser(localUser);
      return of(true);
    }

    // 🟢 Nếu không có user FE → thử gọi BE (Google Login)
    return this.userService.me().pipe(
      tap((resp) => this.tokenStorageService.saveUser(resp)),
      map(() => true),
      catchError(() => {
        // Nếu BE không phản hồi → quay về trang index
        return of(this.router.createUrlTree(['/index']));
      })
    );
  }
}