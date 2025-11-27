import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../pages/toast/toast.service'; // Import Toast
import { ModalService } from '../../../../pages/modal/modal.service'; // Import Modal

// import { AddUserDialogComponent } from '...'; // Import Dialog (Tạm thời comment nếu chưa tạo file)

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-users.component.html',
    styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
    users: any[] = [];
    allUsers: any[] = [];
    searchValue = '';
    currentRoleFilter = 'ALL';
    currentUserRole: string = '';

    pageIndex = 0;
    pageSize = 10;
    totalPages = 0;
    pageNumbers: number[] = [];

    constructor(
        private userService: UserService,
        private authService: AuthService,
        private toast: ToastService, // Inject Toast
        private modal: ModalService  // Inject Modal
    ) {}

    ngOnInit() {
        const roles = this.authService.getRoles();
        if (roles.includes('ROLE_ADMIN')) this.currentUserRole = 'ADMIN';
        else if (roles.includes('ROLE_STAFF')) this.currentUserRole = 'STAFF';
        else if (roles.includes('ROLE_TECHNICIAN')) this.currentUserRole = 'TECHNICIAN';
        else this.currentUserRole = 'CUSTOMER';

        // Mặc định Staff xem Customer
        if (this.currentUserRole === 'STAFF') {
            this.currentRoleFilter = 'CUSTOMER';
        }

        this.loadUsers();
    }

    loadUsers() {
        this.userService.getAllUsers().subscribe({
            next: (res: any) => {
                this.allUsers = res;
                this.applyFilter();
            },
            error: (err: any) => console.error('Failed', err)
        });
    }

    // --- [MỚI] Toggle Status ---
    toggleStatus(user: any) {
        const newStatus = !user.active;
        const action = newStatus ? 'Enable' : 'Disable';

        if(confirm(`Are you sure you want to ${action} this user?`)) {
            this.userService.updateUserStatus(user.id, newStatus).subscribe({
                next: () => {
                    user.active = newStatus;
                    this.toast.success(`User ${action}d successfully`);
                },
                error: (err: any) => this.toast.error("Failed to update status")
            });
        }
    }

    // --- [MỚI] Create User ---
    onCreateUser() {
        alert("Tính năng Add User Dialog đang phát triển. Vui lòng chờ update sau.");
        /* Code chuẩn khi có Dialog:
        const ref = this.modal.open(AddUserDialogComponent, {
            data: { title: 'Add New Member' }
        });
        ref.afterClosed$.subscribe((result: any) => {
            if(result) this.loadUsers();
        });
        */
    }

    // ... Các hàm filter cũ (Giữ nguyên logic) ...
    filterRole(role: string) {
        this.currentRoleFilter = role;
        this.pageIndex = 0;
        this.applyFilter();
    }

    applyFilter() {
        let filtered = [...this.allUsers];

        if (this.currentUserRole === 'STAFF') {
            if (['ALL', 'ADMIN', 'STAFF'].includes(this.currentRoleFilter)) {
                filtered = filtered.filter(u => {
                    const r = this.getRoleName(u);
                    return r === 'CUSTOMER' || r === 'TECHNICIAN';
                });
            }
        }

        if (this.currentRoleFilter !== 'ALL') {
            filtered = filtered.filter(u => this.getRoleName(u) === this.currentRoleFilter);
        }

        if (this.searchValue) {
            const term = this.searchValue.toLowerCase();
            filtered = filtered.filter(u =>
                (u.email?.toLowerCase().includes(term)) ||
                (u.fullName?.toLowerCase().includes(term)) ||
                (u.centerName?.toLowerCase().includes(term))
            );
        }

        if (['STAFF', 'TECHNICIAN'].includes(this.currentRoleFilter)) {
            filtered.sort((a, b) => (a.centerName || 'ZZ').localeCompare(b.centerName || 'ZZ'));
        }

        this.totalPages = Math.ceil(filtered.length / this.pageSize);
        this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        if (this.pageIndex >= this.totalPages) this.pageIndex = Math.max(0, this.totalPages - 1);

        const start = this.pageIndex * this.pageSize;
        this.users = filtered.slice(start, start + this.pageSize);
    }

    onSearch() { this.pageIndex = 0; this.applyFilter(); }

    onPageChange(page: number) {
        let newIndex = page;
        if (this.pageNumbers.includes(page)) newIndex = page - 1;
        if (newIndex >= 0 && newIndex < this.totalPages) {
            this.pageIndex = newIndex;
            this.applyFilter();
        }
    }

    getRoleName(user: any): string {
        if (!user.roles || user.roles.length === 0) return 'USER';
        const role = Array.isArray(user.roles) ? user.roles[0] : user.roles;
        return typeof role === 'string' ? role : role.name;
    }
}