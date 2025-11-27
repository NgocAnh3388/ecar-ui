import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CenterService } from '../../../services/center.service';
import { Center } from '../../../models/center';

@Component({
    selector: 'app-service-centers',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './service-centers.component.html'
})
export class ServiceCentersComponent implements OnInit {

    // Mảng chứa dữ liệu lấy từ API
    centers: Center[] = [];

    constructor(private centerService: CenterService) {}

    ngOnInit(): void {
        this.loadData();
    }

    // Gọi API lấy danh sách
    loadData() {
        this.centerService.getAll().subscribe({
            next: (data) => {
                this.centers = data;
                console.log('Centers loaded successfully:', data);
            },
            error: (err) => {
                console.error('Failed to load centers:', err);
            }
        });
    }

    // Các hàm xử lý sự kiện nút bấm
    openAddCenter() {
        alert('Feature: Open Add Center Dialog (Coming soon)');
    }

    openEditCenter(c: Center) {
        alert('Feature: Edit Center: ' + c.centerName);
    }

    deleteCenter(id: number) {
        if (confirm('Are you sure you want to delete this center?')) {
            this.centerService.delete(id).subscribe({
                next: () => {
                    alert('Deleted successfully!');
                    this.loadData(); // Load lại bảng sau khi xóa
                },
                error: (err) => alert('Failed to delete!')
            });
        }
    }
}