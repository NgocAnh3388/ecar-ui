import {
  CanActivate,
  Router,
  UrlTree,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService,
    private tokenStorageService: TokenStorageService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    const currentUrl = state.url;

    if (
      currentUrl.includes('paypal/success') ||
      currentUrl.includes('paypal/cancel')
    ) {
      return of(true);
    }

    return this.userService.me().pipe(
      tap((resp) => this.tokenStorageService.saveUser(resp)),
      map((user) => {
        if (!user || !user.roles) {
          return this.router.createUrlTree(['/index']);
        }

        const roles: string[] = user.roles;

        if (roles.includes('ROLE_CUSTOMER')) {
          if (currentUrl === '/' || currentUrl === '/profile') {
            this.router.navigate(['/profile/me']);
            return false;
          }
          return true;
        }

        if (roles.includes('ROLE_ADMIN')) {
          if (currentUrl === '/' || currentUrl === '/profile') {
            this.router.navigate(['/users']);
            return false;
          }
          return true;
        }

        if (roles.includes('ROLE_STAFF') || roles.includes('ROLE_TECHNICIAN')) {
          if (currentUrl === '/' || currentUrl === '/profile') {
            this.router.navigate(['/service-dashboard']);
            return false;
          }
          return true;
        }

        return true;
      }),
      catchError(() => of(this.router.createUrlTree(['/index'])))
    );
  }
}
