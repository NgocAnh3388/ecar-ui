import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

// --- 1. SỬA ĐƯỜNG DẪN SERVICE (3 cấp ../) ---
import { UserService } from '../../../services/user.service';

// --- 2. IMPORT UI COMPONENTS (3 cấp ../) ---
import { InputFieldComponent } from "../../../shared/components/form/input/input-field.component";
import { LabelComponent } from "../../../shared/components/form/label/label.component";
import { SelectComponent } from "../../../shared/components/form/select/select.component";
import { ButtonComponent } from "../../../shared/components/ui/button/button.component";

// --- 3. IMPORT MODAL TOKENS (2 cấp ../ vì cùng nằm trong pages) ---
import { MODAL_DATA } from "../../modal/modal.token";
import { ModalRef } from "../../modal/modal-ref";

@Component({
    selector: 'app-user-dialog',
    templateUrl: './user-dialog.component.html',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputFieldComponent,
        LabelComponent,
        SelectComponent,
        ButtonComponent
    ]
})
export class UserDialogComponent implements OnInit {
    userForm: FormGroup;
    title: string = 'User Details';
    btnLabel: string = 'Save';
    isAdmin: boolean = false;
    isEditProfile: boolean = false;
    currentUserId: number | null = null;

    options = [
        { value: 'CUSTOMER', label: 'CUSTOMER' },
        { value: 'ADMIN', label: 'ADMIN' },
        { value: 'STAFF', label: 'STAFF' },
        { value: 'TECHNICIAN', label: 'TECHNICIAN' },
    ];

    // Inject dependencies
    private data = inject(MODAL_DATA, { optional: true });
    private modalRef = inject<ModalRef<any>>(ModalRef);
    private fb = inject(FormBuilder);
    private userService = inject(UserService);

    constructor() {
        this.userForm = this.fb.group({
            fullName: ['', Validators.required],
            phoneNo: ['',
                [Validators.required, Validators.pattern('^[0-9]*$')],
                [this.phoneExistsValidator()]
            ],
            email: ['',
                [Validators.required, Validators.email],
                [this.emailExistsValidator()]
            ],
            role: ['CUSTOMER']
        });
    }

    ngOnInit(): void {
        if (this.data) {
            this.title = this.data.title || 'User Details';
            this.btnLabel = this.data.btnLabel || 'Save';
            this.isAdmin = !!this.data.isAdmin;
            this.isEditProfile = !!this.data.isEditProfile;

            const userData = this.data.user || this.data;
            this.currentUserId = userData?.id || null;

            if (userData) {
                this.userForm.patchValue({
                    fullName: userData.fullName,
                    phoneNo: userData.phoneNo,
                    email: userData.email,
                    role: (userData.roles && userData.roles.length > 0) ? userData.roles[0] : 'CUSTOMER'
                });
            }

            if (this.isEditProfile) {
                this.userForm.get('email')?.disable();
            }
        }
    }

    close() {
        this.modalRef.close();
    }

    onSubmit() {
        if (this.userForm.valid) {
            this.modalRef.close(this.userForm.getRawValue());
        } else {
            this.userForm.markAllAsTouched();
        }
    }

    // Helper functions for HTML template
    handleEmailChange(val: any) { this.userForm.get('email')?.setValue(val); }
    handleFullNameChange(val: any) { this.userForm.get('fullName')?.setValue(val); }
    handlePhoneChange(val: any) { this.userForm.get('phoneNo')?.setValue(val); }
    handleSelectChange(val: any) { this.userForm.get('role')?.setValue(val); }
    cancel() { this.close(); }
    ok() { this.onSubmit(); }

    // Validators
    emailExistsValidator(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            if (!control.value || control.disabled) return of(null);
            return timer(500).pipe(
                switchMap(() => this.userService.searchUsers(control.value, 10, 0)),
                map((res: any) => {
                    const users = res.content || [];
                    const existingUser = users.find((u: any) => u.email.toLowerCase() === control.value.toLowerCase());
                    if (existingUser && (!this.currentUserId || existingUser.id !== this.currentUserId)) {
                        return { emailExists: true };
                    }
                    return null;
                }),
                catchError(() => of(null))
            );
        };
    }

    phoneExistsValidator(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            if (!control.value || control.disabled) return of(null);
            return timer(500).pipe(
                switchMap(() => this.userService.searchUsers(control.value, 10, 0)),
                map((res: any) => {
                    const users = res.content || [];
                    const existingUser = users.find((u: any) => u.phoneNo === control.value);
                    if (existingUser && (!this.currentUserId || existingUser.id !== this.currentUserId)) {
                        return { phoneExists: true };
                    }
                    return null;
                }),
                catchError(() => of(null))
            );
        };
    }
}