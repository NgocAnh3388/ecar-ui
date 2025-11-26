import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// Services
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../pages/modal/modal.service';
import { VehicleService } from '../../services/vehicle.service';
import { ToastService } from '../toast/toast.service';

// Models
import { User } from '../../models/user';
import { UserDto } from '../../models/user-dto';

// Components & Dialogs
import { CreateCarDialogComponent } from '../../pages/dialog/create-car-dialog/create-car-dialog.component';
import { UserDialogComponent } from '../../pages/dialog/user-dialog/user-dialog.component';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UserMetaCardComponent } from '../../shared/components/user-profile/user-meta-card/user-meta-card.component';
import { UserInfoCardComponent } from '../../shared/components/user-profile/user-info-card/user-info-card.component';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        PageBreadcrumbComponent,
        UserMetaCardComponent,
        UserInfoCardComponent,
    ],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    userId!: string;
    userData: User = new User({ vehicles: [] });
    isLoading = true;

    constructor(
        private route: ActivatedRoute,
        private userService: UserService,
        public authService: AuthService,
        private modal: ModalService,
        private toastService: ToastService,
        private vehicleService: VehicleService
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');

            // Logic: Nếu id là 'me' HOẶC null -> Xem profile chính mình
            if (id === 'me' || !id) {
                this.loadMe();
            }
            // Logic: Nếu id là số -> Xem profile người khác (Chỉ Admin mới vào được đây)
            else {
                this.userId = id;
                this.getUserById(id);
            }
        });
    }

    loadMe() {
        this.userService.me().subscribe({
            next: (user) => {
                this.userData = user;
                this.userId = user.id.toString();
                this.isLoading = false;
                localStorage.setItem('user', JSON.stringify(user));
            },
            error: (err) => {
                console.error('Lỗi tải profile:', err);
                this.isLoading = false;
            }
        });
    }

    getUserById(id: string) {
        this.userService.getUserById(id).subscribe({
            next: (user: User) => {
                this.userData = user;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Lỗi tải user:', err);
                this.isLoading = false;
                this.toastService.error('User not found');
            }
        });
    }

    editProfile() {
        const roles = this.authService.getRoles();
        const isAdmin = roles.includes('ROLE_ADMIN');

        const ref = this.modal.open(UserDialogComponent, {
            data: {
                user: this.userData,
                title: 'Edit Profile',
                isEdit: true,
                isEditProfile: true,
                isAdmin: isAdmin
            },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
            disableClose: false,
        });

        ref.afterClosed$.subscribe(updatedInfo => {
            if (updatedInfo) {
                this.handleUpdateUser(updatedInfo);
            }
        });
    }

    handleUpdateUser(info: any) {
        if (!this.userId) return;

        const dto: UserDto = {
            email: info.email,
            fullName: info.fullName,
            phoneNo: info.phoneNo,
            role: info.role || (this.userData.roles && this.userData.roles[0]) || 'CUSTOMER'
        };

        this.isLoading = true;
        this.userService.updateUser(Number(this.userId), dto).subscribe({
            next: () => {
                this.toastService.success('Profile updated successfully!');

                // Reload lại đúng hàm tùy theo đang xem ai
                const currentUser = this.authService.getUser();
                if (currentUser && this.userId === currentUser.id.toString()) {
                    this.loadMe();
                } else {
                    this.getUserById(this.userId);
                }            },
            error: (err) => {
                console.error('Error updating profile:', err);
                this.toastService.error('Failed to update profile.');
                this.isLoading = false;
            }
        });
    }

    addVehicle() {
        const ref = this.modal.open(CreateCarDialogComponent, {
            data: { title: 'Add Vehicle' },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
            disableClose: false,
        });

        ref.afterClosed$.subscribe(vehicleData => {
            if (vehicleData) {
                this.handleCreateVehicle(vehicleData);
            }
        });
    }

    handleCreateVehicle(data: any) {
        this.isLoading = true;
        this.vehicleService.addVehicle(data).subscribe({
            next: () => {
                this.toastService.success('Vehicle added successfully!');
                if (this.userId) {
                    this.getUserById(this.userId);
                } else {
                    this.loadMe();
                }
            },
            error: (err) => {
                console.error('Add vehicle error:', err);
                const errorMessage = err.error?.message || 'Failed to add vehicle.';
                this.toastService.error(errorMessage);
                this.isLoading = false;
            }
        });
    }
}