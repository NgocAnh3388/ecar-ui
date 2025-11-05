export class UserDto {
    email: string;
    fullName: string;
    role: string;
    phoneNo: string;

    constructor(email: string, fullName: string, role: string, phoneNo: string) {
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.phoneNo = phoneNo;
    }
}