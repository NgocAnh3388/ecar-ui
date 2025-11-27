import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../ui/modal/modal.component';
import { User } from '../../../../models/user';
import { ModalService } from '../../../services/modal.service';
import { UserService } from '../../../../services/user.service';
import { UserDialogComponent } from '../../../../pages/dialog/user-dialog/user-dialog.component';


@Component({
    selector: 'app-user-info-card',
    standalone: true,
    imports: [
        CommonModule,
        ModalComponent,
        FormsModule,
    ],
    templateUrl: './user-info-card.component.html',
    styles: []
})
export class UserInfoCardComponent {
    @Input() user!: User;

    private userService = inject(UserService);
    public modal = inject(ModalService);

    isOpen = false;
    isEditMode = false;
    editData: any = {};
    isSaving = false;

    openModal() {
        this.isOpen = true;
    }

    closeModal() {
        this.isOpen = false;
    }

    enableEdit() {
        this.isEditMode = true;
        this.editData = {
            fullName: this.user.fullName,
            email: this.user.email,
            phoneNo: this.user.phoneNo
        };
    }

    cancelEdit() {
        this.isEditMode = false;
        this.editData = {};
    }

    saveChanges() {
        if (!this.user.id) return;

        this.isSaving = true;
        const updateData = {
            fullName: this.editData.fullName,
            email: this.editData.email,
            phoneNo: this.editData.phoneNo,
            // Thêm dòng này để lấy role từ mảng roles của user
            role: (this.user.roles && this.user.roles.length > 0) ? this.user.roles[0] : 'CUSTOMER'
        };

        this.userService.updateUser(this.user.id, updateData).subscribe({
            next: () => {
                // Cập nhật lại dữ liệu hiển thị
                // Lưu ý: Vì updateData có 'role' (string) còn this.user có 'roles' (array),
                // ta chỉ nên merge các trường thông tin cơ bản để tránh lỗi giao diện.
                this.user.fullName = updateData.fullName;
                this.user.email = updateData.email;
                this.user.phoneNo = updateData.phoneNo;

                this.isEditMode = false;
                this.isSaving = false;
            },
            error: err => {
                console.error('Error updating user:', err);
                this.isSaving = false;
            }
        });
    }
}