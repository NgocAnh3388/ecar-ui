import {AfterViewInit, Component, OnInit} from '@angular/core';
import {BadgeComponent} from "../../../shared/components/ui/badge/badge.component";
import {ButtonComponent} from "../../../shared/components/ui/button/button.component";
import {TableDropdownComponent} from "../../../shared/components/common/table-dropdown/table-dropdown.component";
import {NgClass} from "@angular/common";
import {AuthService} from "../../../services/auth.service";
import {UserService} from "../../../services/user.service";
import {catchError, EMPTY, finalize, tap} from "rxjs";
import {User} from "../../../models/user";
import {ModalService} from "../../modal/modal.service";
import {ConfirmDialogComponent} from "../../dialog/confirm-dialog/confirm-dialog.component";
import {UserDialogComponent} from "../../dialog/user-dialog/user-dialog.component";
import {ToastService} from "../../toast/toast.service";
import {UserDto} from "../../../models/user-dto";
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-management',
    imports: [
        BadgeComponent,
        ButtonComponent,
        TableDropdownComponent,
        NgClass
    ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit, AfterViewInit {
    searchValue = '';
    pageSize = 10;
    pageIndex = 0;
    totalItems = 0;
    totalPageNum = 0;
    isLoadingResults = true;
    dataSource: User[] = [];

    constructor(private auth: AuthService,
                private userService: UserService,
                private modal: ModalService,
                private toast: ToastService,
                private router: Router) {
    }

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {
        this.onSearchUsers(0);
    }

    onSearchUsers(pageIndex: number) {
        this.isLoadingResults = true;
        this.userService.searchUsers(this.searchValue, this.pageSize, pageIndex).pipe(
            finalize(() => { this.isLoadingResults = false; }),
            catchError(err => {
                console.error(err);
                return EMPTY;
            })
        ).subscribe(res => {
            this.dataSource = res.content;
            this.totalItems = res.page.totalElements;
            this.totalPageNum = res.page.totalPages;
        });
    }

    currentPage = this.pageIndex + 1;

    get totalPages(): number {
        return this.totalPageNum;
    }

    get currentItems(): User[] {
        return this.dataSource;
    }

    goToPage(page: number) {
        this.onSearchUsers(page - 1);
        this.currentPage = page;
    }

    getBadgeColor(role: string): 'success' | 'warning' | 'error' {
        if (role === 'CUSTOMER') return 'success';
        return 'error';
    }

    deleteUser(id: number) {
        const ref = this.modal.open(ConfirmDialogComponent, {
            data: { title: 'Xoá người dùng', message: 'Bạn có chắc muốn xoá?' },
            panelClass: ['modal-panel', 'p-0'], // có thể thêm class tuỳ ý
            backdropClass: 'modal-backdrop',
            disableClose: false,
        });

        ref.afterClosed$.subscribe(confirmed => {
            if (confirmed) {
                this.userService.deleteUser(id).subscribe(() => {
                    this.toast.success('Lưu thành công', {
                        title: 'Thành công',
                        duration: 2500,
                        position: 'top-right'
                    });
                    this.onSearchUsers(this.pageIndex);
                })

            }
        });
    }

    onCreateUser() {
        const ref = this.modal.open(UserDialogComponent, {
            data: { title: 'Thêm', message: '', isEdit: false },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
            disableClose: false,
        });

        ref.afterClosed$.subscribe(confirmed => {
            if (confirmed) {
                this.toast.success('Lưu thành công', {
                    title: 'Thành công',
                    duration: 2500,
                    position: 'top-right'
                });
                this.onSearchUsers(this.pageIndex);
            }
        });
    }

    editUser(user: User) {
        const ref = this.modal.open(UserDialogComponent, {
            data: { title: 'Chỉnh sửa', message: '', user: user, isEdit: true},
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
            disableClose: false,
        });

        ref.afterClosed$.subscribe(confirmed => {
            if (confirmed) {
                this.toast.success('Lưu thành công', {
                    title: 'Thành công',
                    duration: 2500,
                    position: 'top-right'
                });
                this.onSearchUsers(this.pageIndex);
            }
        });
    }

    viewProfile(userId: number) {
      this.router.navigate(['/profile', userId]);
    }

}
