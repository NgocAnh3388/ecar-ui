import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loading-spinner',
    standalone: true,
    imports: [CommonModule], // CommonModule cần thiết cho các directive như *ngIf nếu bạn muốn dùng chúng ở đây
    templateUrl: './loading-spinner.component.html',
    styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent {

    constructor() { }

}