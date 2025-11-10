import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Import AuthService

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink
    ],
    templateUrl: './signup.component.html',
    // styleUrls: ['./signup.component.css']
})
export class SignupComponent {
    model: any = {};
    rePassword = '';

    // SỬA LẠI CONSTRUCTOR: Inject AuthService
    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    onSubmit() {
        if (this.model.password !== this.rePassword) {
            alert("Passwords do not match!");
            return;
        }

        // SỬA LẠI: Gọi hàm register từ AuthService
        this.authService.register(this.model).subscribe({
            next: (response) => {
                console.log('Registration successful', response);
                alert('Registration successful! Please log in.');
                this.router.navigate(['/login']);
            },
            error: (error) => {
                console.error('Registration failed', error);
                alert(error.error.message || 'Registration failed. Please try again.');
            },
        });
    }

    onGoogleSignUp() {
        // Gọi hàm trong AuthService
        this.authService.loginWithGoogle();
    }
}