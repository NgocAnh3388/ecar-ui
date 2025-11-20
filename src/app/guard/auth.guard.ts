import {
    CanActivateFn,
    Router,
    UrlTree,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
} from '@angular/router';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
): Observable<boolean | UrlTree> | boolean | UrlTree => {

    const authService = inject(AuthService);
    const router = inject(Router);
    const currentUrl = state.url;

    // 1. Kiểm tra user cache
    const user = authService.getUser();
    if (user && user.roles) {
        return true; // Đã login → cho phép vào bất kỳ route nào
    }

    // 2. Nếu chưa có cache, gọi API để lấy user
    return authService.getCurrentUser().pipe(
        map((userFromApi) => {
            if (!userFromApi || !userFromApi.roles) {
                // Chưa login → redirect về /index
                return router.createUrlTree(['/index']);
            }
            return true; // Đã login → cho phép vào bất kỳ route nào
        }),
        catchError(() => of(router.createUrlTree(['/index']))) // Nếu API lỗi → redirect về /index
    );
};
