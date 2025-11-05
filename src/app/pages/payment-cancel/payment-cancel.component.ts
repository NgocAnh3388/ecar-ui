// payment-cancel.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
    selector: 'app-payment-cancel',
    standalone: true,
    imports: [CommonModule], // Thêm CommonModule vào imports
    template: `
    <div style="text-align: center; padding: 50px; font-family: sans-serif;">
      <h2>Transaction has been canceled.</h2>
      <p>You will be redirected to the dashboard in a moment...</p>
      <!-- Bạn có thể thêm một spinner ở đây nếu muốn -->
    </div>
  `,
})
export class PaymentCancelComponent implements OnInit {

    constructor(private router: Router) { }

    ngOnInit(): void {
        // Đợi 3 giây rồi chuyển về trang dashboard
        setTimeout(() => {
            this.router.navigate(['/customer-payment-dashboard']);
        }, 3000); // 3000 milliseconds = 3 giây
    }
}