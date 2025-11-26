import { Component, ElementRef, ViewChild, OnDestroy, AfterViewInit, OnInit } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeToggleButtonComponent } from '../../components/common/theme-toggle/theme-toggle-button.component';
import { UserDropdownComponent } from '../../components/header/user-dropdown/user-dropdown.component';
import { AuthService } from '../../../services/auth.service'; // Import AuthService

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
export class AppHeaderComponent implements OnInit, AfterViewInit, OnDestroy { // Thêm OnInit
    isApplicationMenuOpen = false;
    readonly isMobileOpen$;

    isOpenNotifications = false;
    hasUnreadNotification = false; // Biến kiểm soát chấm đỏ

    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

    constructor(
        public sidebarService: SidebarService,
        private authService: AuthService // Inject AuthService
    ) {
        this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    }

    ngOnInit() {
        // Giả lập thông báo cho Staff
        const roles = this.authService.getRoles();
        if (roles.includes('ROLE_STAFF') || roles.includes('STAFF')) {
            this.hasUnreadNotification = true;
        }
    }

    // ... các hàm khác giữ nguyên
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