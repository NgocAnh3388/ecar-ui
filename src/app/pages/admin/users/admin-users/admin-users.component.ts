import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service'; // 1. Import AuthService

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-users.component.html',
    styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
    users: any[] = [];
    allUsers: any[] = [];
    searchValue = '';

    currentRoleFilter = 'ALL';
    currentUserRole: string = ''; // 2. Khai báo biến này

    pageIndex = 0;
    pageSize = 10;
    totalPages = 0;
    pageNumbers: number[] = [];

    constructor(
        private userService: UserService,
        private authService: AuthService // 3. Inject AuthService
    ) {}

    ngOnInit() {
        // 4. Lấy Role của người đang đăng nhập
        const roles = this.authService.getRoles(); // Giả sử trả về ['ROLE_STAFF']

        // Chuẩn hóa tên Role
        if (roles.some((r: string) => r.includes('ADMIN'))) {
            this.currentUserRole = 'ADMIN';
        } else if (roles.some((r: string) => r.includes('STAFF'))) {
            this.currentUserRole = 'STAFF';
            // Nếu là Staff -> Mặc định vào tab Customer luôn
            this.currentRoleFilter = 'CUSTOMER';
        } else {
            this.currentUserRole = 'CUSTOMER';
        }

        this.loadUsers();
    }

    loadUsers() {
        this.userService.getAllUsers().subscribe({
            next: (res: any) => {
                this.allUsers = res;
                this.applyFilter();
            },
            error: (err) => console.error('Failed to load users', err)
        });
    }

    filterRole(role: string) {
        this.currentRoleFilter = role;
        this.pageIndex = 0;
        this.applyFilter();
    }

    applyFilter() {
        let filtered = [...this.allUsers];

        // 5. LOGIC BẢO MẬT DỮ LIỆU (Frontend Side)
        // Nếu là Staff -> Chỉ cho phép xem Customer và Technician
        if (this.currentUserRole === 'STAFF') {
            // Chặn nếu cố tình chọn tab Admin hoặc All
            if (['ALL', 'ADMIN', 'STAFF'].includes(this.currentRoleFilter)) {
                // Ép lọc dữ liệu, chỉ lấy Customer và Technician
                filtered = filtered.filter(u => {
                    const r = this.getRoleName(u);
                    return r === 'CUSTOMER' || r === 'TECHNICIAN';
                });
            }
        }

        // 6. Lọc theo Tab đã chọn
        if (this.currentRoleFilter !== 'ALL') {
            filtered = filtered.filter(u => {
                const roleName = this.getRoleName(u);
                return roleName === this.currentRoleFilter;
            });
        }

        // 7. Tìm kiếm
        if (this.searchValue) {
            const term = this.searchValue.toLowerCase();
            filtered = filtered.filter(u =>
                (u.email?.toLowerCase().includes(term)) ||
                (u.fullName?.toLowerCase().includes(term)) ||
                (u.centerName?.toLowerCase().includes(term))
            );
        }

        // 8. Sắp xếp Staff/Tech theo Center
        if (['STAFF', 'TECHNICIAN'].includes(this.currentRoleFilter)) {
            filtered.sort((a, b) => (a.centerName || 'ZZ').localeCompare(b.centerName || 'ZZ'));
        }

        // 9. Phân trang
        this.totalPages = Math.ceil(filtered.length / this.pageSize);
        this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);

        if (this.pageIndex >= this.totalPages) this.pageIndex = Math.max(0, this.totalPages - 1);

        const start = this.pageIndex * this.pageSize;
        this.users = filtered.slice(start, start + this.pageSize);
    }

    onSearch() {
        this.pageIndex = 0;
        this.applyFilter();
    }

    onPageChange(page: number) {
        // Xử lý cả trường hợp truyền index (0,1) hoặc page number (1,2)
        let newIndex = page;
        // Nếu bấm vào số trang (1, 2, 3) -> Chuyển về index (0, 1, 2)
        if (this.pageNumbers.includes(page)) {
            newIndex = page - 1;
        }

        if (newIndex >= 0 && newIndex < this.totalPages) {
            this.pageIndex = newIndex;
            this.applyFilter();
        }
    }

    onCreateUser() {
        alert("Feature coming soon");
    }

    getRoleName(user: any): string {
        if (!user.roles || user.roles.length === 0) return 'USER';
        const role = Array.isArray(user.roles) ? user.roles[0] : user.roles;
        return typeof role === 'string' ? role : role.name;
    }
}