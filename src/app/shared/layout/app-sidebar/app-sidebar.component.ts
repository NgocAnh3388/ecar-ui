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
    styleUrls: ['./sidebar-styles.css'],
})
export class AppSidebarComponent implements OnInit, OnDestroy {

    navItems: NavItem[] = [
<<<<<<< Updated upstream
        { name: 'User management', icon: '👤', path: '/users' },
        { name: 'Booking', icon: '🚗', path: '/customer-schedule' },
        { name: 'Maintenance information', icon: '🧾', path: '/customer-maintenance' },
        { name: 'Service package management', icon: '📦', path: '/customer-payment-dashboard' },
        { name: 'Service management', icon: '🧰', path: '/service-dashboard' },
        { name: 'Parts & Inventory', icon: '🧩', path: '/admin/parts-management' },
        { name: 'Overview', icon: '📊', path: '/' },
        { name: 'User Profile', icon: '👥', path: '/profile' },
=======
        {
            name: 'User management',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
            path: '/users'
        },
        {
            name: 'Booking',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
            path: '/customer-schedule'
        },
        {
            name: 'Maintenance information',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
            path: '/customer-maintenance'
        },
        {
            name: 'Service package management',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
            path: '/customer-payment-dashboard'
        },
        {
            name: 'Service management',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
            path: '/service-dashboard'
        },
        {
            name: 'Parts & Inventory',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
            path: '/admin/parts-management'
        },
        {
            name: 'Overview',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
            path: '/overview'
        },
        {
            name: 'User Profile',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
            path: '/profile'
        },
>>>>>>> Stashed changes
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
            'Overview': ['ROLE_ADMIN'],
            'User Profile': ['ROLE_CUSTOMER'],
            'Parts & Inventory': ['ROLE_ADMIN', 'ROLE_STAFF'],
        };
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
