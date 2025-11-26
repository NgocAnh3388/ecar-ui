import { Component, ElementRef, ViewChild, OnDestroy, AfterViewInit, OnInit } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeToggleButtonComponent } from '../../components/common/theme-toggle/theme-toggle-button.component';
import { UserDropdownComponent } from '../../components/header/user-dropdown/user-dropdown.component';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service'; // Import NotificationService

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ThemeToggleButtonComponent,
        UserDropdownComponent,
    ],
    templateUrl: './app-header.component.html',
})
export class AppHeaderComponent implements OnInit, AfterViewInit, OnDestroy {
    isApplicationMenuOpen = false;
    readonly isMobileOpen$;

    isOpenNotifications = false;
    hasUnreadNotification = false;
    notifications: any[] = []; // Danh sách thông báo

    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

    constructor(
        public sidebarService: SidebarService,
        private authService: AuthService,
        private notiService: NotificationService // Inject NotificationService
    ) {
        this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    }

    ngOnInit() {
        // Load thông báo ngay khi khởi tạo
        this.loadNotifications();

        // (Optional) Polling: Tự động gọi lại sau mỗi 30s
        setInterval(() => this.loadNotifications(), 30000);
    }

    loadNotifications() {
        this.notiService.getMyNotifications().subscribe({
            next: (data: any[]) => { // Thêm : any[]
                this.notifications = data;
                // Sửa n => !n.read thành n: any => !n.read để tránh lỗi
                this.hasUnreadNotification = data.some((n: any) => !n.read);
            },
            error: (err: any) => console.error('Failed to load notifications', err) // Thêm : any
        });
    }

    markAllRead() {
        this.notiService.markAllAsRead().subscribe({
            next: () => {
                this.hasUnreadNotification = false;
                this.notifications.forEach((n: any) => n.read = true); // Thêm : any
            },
            error: (err: any) => console.error('Failed to mark as read', err) // Thêm : any
        });
    }

    // --- UI Helpers ---
    handleToggle() {
        if (window.innerWidth >= 1280) {
            this.sidebarService.toggleExpanded();
        } else {
            this.sidebarService.toggleMobileOpen();
        }
    }

    toggleApplicationMenu() {
        this.isApplicationMenuOpen = !this.isApplicationMenuOpen;
    }

    ngAfterViewInit() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    ngOnDestroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            this.searchInput?.nativeElement.focus();
        }
    };
}