import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    title = 'Angular Ecommerce Dashboard | TailAdmin';

    constructor(private authService: AuthService, private router: Router) {}

    ngOnInit(): void {
        const currentUrl = this.router.url;

        // Bỏ qua auto-redirect nếu đang ở trang callback hoặc trang protected
        const publicPages = ['/index', '/signin', '/signup'];
        if (!publicPages.includes(currentUrl) && !currentUrl.includes('paypal')) {
            // Đã ở trang protected → không redirect
            return;
        }

        // Nếu localStorage đã có user → redirect theo role
        const user = this.authService.getUser();
        if (user && user.roles?.length) {
            this.redirectByRole(user.roles, currentUrl);
            return;
        }

        // Nếu chưa có user → gọi API
        this.authService.getCurrentUser().subscribe({
            next: (userFromApi: any) => {
                if (userFromApi && userFromApi.roles?.length) {
                    this.redirectByRole(userFromApi.roles, currentUrl);
                } else if (publicPages.includes(currentUrl)) {
                    // ở trang public → cho phép
                } else {
                    this.router.navigate(['/signin']);
                }
            },
            error: () => {
                if (!publicPages.includes(currentUrl)) {
                    this.router.navigate(['/signin']);
                }
            }
        });
    }

    private redirectByRole(roles: string[], currentUrl: string) {
        if (roles.includes('ROLE_ADMIN')) {
            if (['/index', '/signin', '/signup'].includes(currentUrl)) {
                this.router.navigate(['/users']);
            }
        } else if (roles.includes('ROLE_STAFF') || roles.includes('ROLE_TECHNICIAN')) {
            if (['/index', '/signin', '/signup'].includes(currentUrl)) {
                this.router.navigate(['/service-dashboard']);
            }
        } else if (roles.includes('ROLE_CUSTOMER')) {
            if (['/index', '/signin', '/signup'].includes(currentUrl)) {
                this.router.navigate(['/profile/me']);
            }
        }
    }
}
