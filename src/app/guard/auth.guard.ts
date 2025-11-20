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

    // 1. Kiểm tra user trong localStorage (nhanh)
    const user = authService.getUser();

    if (user && user.roles) {
        // Nếu có user, kiểm tra điều hướng
        return checkRoleAndRedirect(user.roles, currentUrl, router);
    }

    // 2. Nếu không có user, gọi API /api/me
    return authService.getCurrentUser().pipe(
        map((userFromApi) => {
            if (!userFromApi || !userFromApi.roles) {
                return router.createUrlTree(['/index']); // Không có user, ở lại index
            }
            return checkRoleAndRedirect(userFromApi.roles, currentUrl, router);
        }),
        catchError(() => {
            // Lỗi (chưa đăng nhập), ở lại index
            // Quan trọng: Trả về TRUE vì trang index cho phép người lạ
            if (currentUrl === '/index' || currentUrl === '/about' || currentUrl === '/service') {
                return of(true);
            }
            return of(router.createUrlTree(['/index']));
        })
    );
};

/**
 * Hàm helper để xử lý logic điều hướng
 */
function checkRoleAndRedirect(roles: string[], currentUrl: string, router: Router): boolean | UrlTree {

    // Landing page gồm '/' và '/index'
    const isAtLandingPage = currentUrl === '/index' || currentUrl === '/';

    if (roles.includes('ROLE_ADMIN')) {
        return true;
    }

    if (roles.includes('ROLE_STAFF') || roles.includes('ROLE_TECHNICIAN')) {
        if (isAtLandingPage) {
            return router.createUrlTree(['/service-dashboard']);
        }
        return true;
    }

    if (roles.includes('ROLE_CUSTOMER')) {
        if (isAtLandingPage) {
            return router.createUrlTree(['/profile/me']);
        }
        return true;
    }

    return router.createUrlTree(['/index']);
}
