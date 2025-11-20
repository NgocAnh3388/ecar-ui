import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    QueryList,
    ViewChildren,
    ChangeDetectorRef,
    OnInit,
    OnDestroy,
} from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { combineLatest, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

type NavItem = {
    name: string;
    icon: string;
    path?: string;
    new?: boolean;
    pro?: boolean;
    subItems?: { name: string; path: string; new?: boolean; pro?: boolean }[];
};

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule, SafeHtmlPipe],
    templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponent implements OnInit, OnDestroy {
    navItems: NavItem[] = [
        { name: 'User management', icon: '👤', path: '/users' },
        { name: 'Booking', icon: '🚗', path: '/customer-schedule' },
        { name: 'Maintenance information', icon: '🧾', path: '/customer-maintenance' },
        { name: 'Service package management', icon: '📦', path: '/customer-payment-dashboard' },
        { name: 'Service management', icon: '🧰', path: '/service-dashboard' },
        { name: 'Parts & Inventory', icon: '🧩', path: '/admin/parts-management' },
        { name: 'User Profile', icon: '👥', path: '/profile' },
        { name: 'Profit Report', icon: '📈', path: '/admin/profit-report' },

    ];

    othersItems: NavItem[] = [];
    openSubmenu: string | null = null;
    subMenuHeights: { [key: string]: number } = {};

    @ViewChildren('subMenu') subMenuRefs!: QueryList<ElementRef>;

    readonly isExpanded$;
    readonly isMobileOpen$;
    readonly isHovered$;

    private subscription: Subscription = new Subscription();
    userRoles: string[] = [];

    constructor(
        public sidebarService: SidebarService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private authService: AuthService
    ) {
        this.isExpanded$ = this.sidebarService.isExpanded$;
        this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
        this.isHovered$ = this.sidebarService.isHovered$;
    }

    ngOnInit() {
        this.authService.getCurrentUser().subscribe({
            next: (user) => {
                console.log('User object from API:', user);
                this.userRoles = user?.roles || [];
                localStorage.setItem('user', JSON.stringify(user));

                const googleId = user?.claims?.sub;
                const userProfileItem = this.navItems.find(i => i.name === 'User Profile');
                if (userProfileItem && googleId) {
                    userProfileItem.path = this.userRoles.includes('ROLE_ADMIN')
                        ? `/profile/${user.id}`      // numeric id admin
                        : `/profile/me`;             // customer dùng /me
                }

                this.filterMenuByRole();
                this.navItems = [...this.navItems];
                this.cdr.detectChanges();
            },
            error: () => {
                this.userRoles = [];
            },
        });

        // Theo dõi router để highlight active menu
        this.subscription.add(
            this.router.events.subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    this.setActiveMenuFromRoute(this.router.url);
                }
            })
        );

        // Theo dõi trạng thái sidebar
        this.subscription.add(
            combineLatest([this.isExpanded$, this.isMobileOpen$, this.isHovered$]).subscribe(() => {
                this.cdr.detectChanges();
            })
        );

        this.setActiveMenuFromRoute(this.router.url);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    onSidebarMouseEnter() {
        this.sidebarService.setHovered(true);
    }

    onSidebarMouseLeave() {
        this.sidebarService.setHovered(false);
    }

    //Toggle submenu
    toggleSubmenu(prefix: string, index: number) {
        const key = `${prefix}-${index}`;
        this.openSubmenu = this.openSubmenu === key ? null : key;

        setTimeout(() => {
            const el = document.getElementById(key);
            if (el) {
                this.subMenuHeights[key] = el.scrollHeight;
                this.cdr.detectChanges();
            }
        });
    }

    onSubmenuClick() {
        this.isMobileOpen$.subscribe((isMobile) => {
            if (isMobile) this.sidebarService.setMobileOpen(false);
        }).unsubscribe();
    }

    private filterMenuByRole() {
        const roleAccess: Record<string, string[]> = {
            'User management': ['ROLE_ADMIN', 'ROLE_STAFF'],
            'Booking': ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_CUSTOMER', 'ROLE_TECHNICIAN'],
            'Maintenance information': ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_CUSTOMER', 'ROLE_TECHNICIAN'],
            'Service package management': ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_CUSTOMER'],
            'Service management': ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_TECHNICIAN'],
            'User Profile': ['ROLE_CUSTOMER'],
            'Parts & Inventory': ['ROLE_ADMIN', 'ROLE_STAFF'],
            'Profit Report': ['ROLE_ADMIN'],        };
        this.navItems = this.navItems.filter((item) => {
            const allowed = roleAccess[item.name];
            return !allowed || allowed.some((r) => this.userRoles.includes(r));
        });
    }


    isActive(path: string): boolean {
        return this.router.url === path;
    }

    private setActiveMenuFromRoute(currentUrl: string) {
        const menuGroups = [
            { items: this.navItems, prefix: 'main' },
            { items: this.othersItems, prefix: 'others' },
        ];

        menuGroups.forEach((group) => {
            group.items.forEach((nav, i) => {
                if (nav.subItems) {
                    nav.subItems.forEach((subItem) => {
                        if (currentUrl === subItem.path) {
                            const key = `${group.prefix}-${i}`;
                            this.openSubmenu = key;
                            setTimeout(() => {
                                const el = document.getElementById(key);
                                if (el) {
                                    this.subMenuHeights[key] = el.scrollHeight;
                                    this.cdr.detectChanges();
                                }
                            });
                        }
                    });
                }
            });
        });
    }
}
