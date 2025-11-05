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
import { SidebarWidgetComponent } from './app-sidebar-widget.component';
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
    { name: 'Quản lý người dùng', icon: '👤', path: '/users' },
    { name: 'Quản lý xe & lịch sử bảo dưỡng', icon: '🚗', path: '/customer-dashboard' },
    { name: 'Quản lý gói dịch vụ', icon: '📦', path: '/customer-payment-dashboard' },
    { name: 'Quản lý dịch vụ', icon: '🧰', path: '/service-dashboard' },
    { name: 'Ecommerce', icon: '🛒', path: '/' },
    { name: 'User Profile', icon: '👥', path: '/profile' },
  ];

  othersItems: NavItem[] = [];
  openSubmenu: string | null | number = null;
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

  // ✅ Hover handlers (fix lỗi template)
  onSidebarMouseEnter() {
    this.sidebarService.setHovered(true);
  }

  onSidebarMouseLeave() {
    this.sidebarService.setHovered(false);
  }

  ngOnInit() {
    // 🔹 Lấy thông tin user & role từ backend
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.userRoles = user?.roles || [];
        localStorage.setItem('user', JSON.stringify(user));
        this.filterMenuByRole();
      },
      error: () => {
        this.userRoles = [];
      },
    });

    // 🔹 Theo dõi router để cập nhật active menu
    this.subscription.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.setActiveMenuFromRoute(this.router.url);
        }
      })
    );

    // 🔹 Cập nhật khi sidebar thay đổi trạng thái
    this.subscription.add(
      combineLatest([this.isExpanded$, this.isMobileOpen$, this.isHovered$]).subscribe(() => {
        this.cdr.detectChanges();
      })
    );

    this.setActiveMenuFromRoute(this.router.url);
  }

  // ✅ Toggle submenu
  toggleSubmenu(prefix: string, index: number) {
    const key = `${prefix}-${index}`;
    if (this.openSubmenu === key) {
      this.openSubmenu = null;
      this.subMenuHeights[key] = 0;
    } else {
      this.openSubmenu = key;
      const el = document.getElementById(key);
      if (el) {
        this.subMenuHeights[key] = el.scrollHeight;
      }
    }
  }

  // Lọc menu theo role (ẩn menu không được phép)
  private filterMenuByRole() {
    const roleAccess: Record<string, string[]> = {
      'Quản lý người dùng': ['ROLE_ADMIN', 'ROLE_STAFF'],
      'Quản lý xe & lịch sử bảo dưỡng': ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_CUSTOMER', 'ROLE_TECHNICIAN'],
      'Quản lý gói dịch vụ': ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_CUSTOMER', 'ROLE_TECHNICIAN'],
      'Quản lý dịch vụ': ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_TECHNICIAN'],
      'Ecommerce': ['ROLE_ADMIN'],
      'User Profile': [],
    };

    this.navItems = this.navItems.filter((item) => {
      const allowed = roleAccess[item.name];
      return !allowed || allowed.some((r) => this.userRoles.includes(r));
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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

  onSubmenuClick() {
    this.isMobileOpen$.subscribe((isMobile) => {
      if (isMobile) this.sidebarService.setMobileOpen(false);
    }).unsubscribe();
  }
}
