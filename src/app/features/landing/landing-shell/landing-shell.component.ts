import {
    Component, OnInit, signal, ViewEncapsulation
} from '@angular/core';
import { AuthService } from "../../../services/auth.service";
import { NgOptimizedImage } from "@angular/common";
import { Router, RouterModule } from "@angular/router";

@Component({
    selector: 'app-landing-shell',
    standalone: true,
    templateUrl: './landing-shell.component.html', // File HTML "Hero" của bạn
    styleUrls: ['./landing-shell.component.css'],
    encapsulation: ViewEncapsulation.ShadowDom,
    imports: [
        NgOptimizedImage,
        RouterModule // Cần cho routerLink
    ],
})
export class LandingShellComponent implements OnInit {

    user = signal<any | null>(null);
    loading = signal(true);

    constructor(
        private auth: AuthService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.refreshUser();
    }

    /**
     * Lấy thông tin user (dùng logic mới)
     */
    refreshUser() {
        this.loading.set(true);
        // Thử lấy từ localStorage trước
        const localUser = this.auth.getUser();

        if (localUser) {
            this.user.set(localUser);
            this.loading.set(false);
        } else {
            // Nếu không có, gọi API /api/me
            this.auth.getCurrentUser().subscribe({
                next: (u) => {
                    this.user.set(u);
                    this.loading.set(false);
                },
                error: () => {
                    this.user.set(null);
                    this.loading.set(false);
                    localStorage.removeItem('user'); // Dọn dẹp
                }
            });
        }
    }

    /**
     * Dùng chung cho cả Login và Sign Up
     */
    login() {
        this.auth.loginWithGoogle();
    }

    /**
     * Đăng xuất
     */
    logout() {
        this.auth.logout();
        this.user.set(null);
    }

    /**
     * Nút Dashboard - SỬ DỤNG HÀM PHÂN QUYỀN MỚI
     */
    goToDashboard() {
        this.auth.navigateToDashboard();
    }
}