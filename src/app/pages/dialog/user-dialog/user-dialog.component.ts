import {Component, inject, OnInit, signal} from '@angular/core';
import {InputFieldComponent} from "../../../shared/components/form/input/input-field.component";
import {LabelComponent} from "../../../shared/components/form/label/label.component";
import {SelectComponent} from "../../../shared/components/form/select/select.component";
import {MODAL_DATA} from "../../modal/modal.token";
import {ModalRef} from "../../modal/modal-ref";
import {ButtonComponent} from "../../../shared/components/ui/button/button.component";
import {User} from "../../../models/user";
import {UserService} from "../../../services/user.service";
import {UserDto} from "../../../models/user-dto";
import {catchError, EMPTY, finalize} from "rxjs";

@Component({
  selector: 'app-user-dialog',
    imports: [
        InputFieldComponent,
        LabelComponent,
        SelectComponent,
        ButtonComponent
    ],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.css'
})
export class UserDialogComponent implements OnInit {
    options = [
        { value: 'CUSTOMER', label: 'CUSTOMER' },
        { value: 'ADMIN', label: 'ADMIN' },
        { value: 'STAFF', label: 'STAFF' },
        { value: 'TECHNICIAN', label: 'TECHNICIAN' },
    ];
    email = '';
    fullName = '';
    phoneNo = '';
    error = false;
    fullNameError = false;
    selectedValue = '';
    isEdit = false;

    constructor(private userService: UserService,) { }

    private data = inject(MODAL_DATA, { optional: true }) as { title?: string; message?: string, user?: User, isEdit?: boolean } | null;
    private modalRef = inject<ModalRef<boolean>>(ModalRef);

    title = signal(this.data?.title ?? 'Xác nhận');
    message = signal(this.data?.message ?? 'Bạn chắc chắn?');

    ngOnInit() {
        this.isEdit = this.data?.isEdit ?? false;
        if (this.data?.isEdit && this.data?.user) {
            console.log(this.data.user.roles[0]);
            this.email = this.data.user.email
            this.fullName = this.data.user.fullName
            this.phoneNo = this.data.user.phoneNo
            this.selectedValue = this.data.user.roles[0]
        } else {
            this.selectedValue = 'CUSTOMER';
        }
    }

    ok() {
        const userDto: UserDto = new UserDto(this.email, this.fullName, this.selectedValue, this.phoneNo)
        console.log(userDto);
        if (this.data?.isEdit && this.data?.user) {
            this.userService.updateUser(userDto).pipe(
                finalize(() => {  }),
                catchError(err => {
                    console.error(err);
                    return EMPTY;
                })
            ).subscribe(res => {
                this.modalRef.close(true);
            });
        } else {
            this.userService.createUser(userDto).pipe(
                finalize(() => {  }),
                catchError(err => {
                    console.error(err);
                    return EMPTY;
                })
            ).subscribe(res => {
                this.modalRef.close(true);
            });
        }
    }
    cancel() { this.modalRef.close(false); }

    validateEmail(value: string): boolean {
        const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
        this.error = !isValidEmail;
        return isValidEmail;
    }

    handleEmailChange(value: string | number) {
        this.email = value.toString();
        this.validateEmail(this.email);
    }

    handleFullNameChange(value: string | number) {
        this.fullName = value.toString();
        this.fullNameError = !(this.fullName.trim() !== '');
    }

    handleSelectChange(value: string) {
        this.selectedValue = value;
    }
}
