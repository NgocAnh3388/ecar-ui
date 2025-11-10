import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    model: any = {
        email: '',
        password: ''
    };

    // SỬA LẠI CONSTRUCTOR: Chỉ cần inject AuthService và Router
    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    onSubmit(): void {
        // Gọi phương thức loginWithPassword từ AuthService đã được inject
        this.authService.loginWithPassword(this.model.email, this.model.password).subscribe({
            next: (user) => {
                console.log('Login with password successful!', user);
                // Sau khi đăng nhập thành công, điều hướng đến trang dashboard phù hợp
                this.router.navigate(['/dashboard']); // Hoặc một trang khác
            },
            error: (err) => {
                console.error('Login failed', err);
                alert(err.error.message || 'Invalid email or password.');
            }
        });
    }

    onGoogleLogin(): void {
        // Gọi hàm trong AuthService
        this.authService.loginWithGoogle();
    }
}