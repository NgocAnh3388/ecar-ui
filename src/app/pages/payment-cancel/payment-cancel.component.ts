import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-payment-cancel',
    standalone: true,
    imports: [CommonModule],
    // Sử dụng templateUrl để code sạch sẽ hơn
    templateUrl: './payment-cancel.component.html',
    styleUrls: ['./payment-cancel.component.css']
})
export class PaymentCancelComponent implements OnInit {

    // 1. Inject Router vào constructor
    constructor(private router: Router) { }

    ngOnInit(): void {
        // 2. Sử dụng setTimeout để đợi 3 giây
        setTimeout(() => {
            // 3. Sau 3 giây, chuyển hướng về trang dashboard
            console.log('Redirecting to dashboard...');
            this.router.navigate(['/customer-payment-dashboard']);
        }, 3000); // 3000 milliseconds = 3 giây
    }
}