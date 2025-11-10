import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // Thêm Router và RouterLink
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
    constructor(private authService: AuthService, private router: Router) {}
    onBookNowClick() {
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/booking']);
        } else {
            this.router.navigate(['/login']);
        }
    }
}
