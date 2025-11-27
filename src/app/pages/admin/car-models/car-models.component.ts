import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarModelService } from '../../../services/car-model.service';
import { CarModel } from '../../../models/car-model';

@Component({
    selector: 'app-car-models',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './car-models.component.html'
})
export class CarModelsComponent implements OnInit {

    carModels: CarModel[] = [];

    constructor(private carModelService: CarModelService) {}

    ngOnInit(): void {
        this.loadData();
    }

    // Gọi API lấy danh sách xe
    loadData() {
        this.carModelService.getAll().subscribe({
            next: (data) => {
                this.carModels = data;
                console.log('Car Models loaded:', data);
            },
            error: (err) => {
                console.error('Error loading car models:', err);
            }
        });
    }

    // Xử lý sự kiện click (Sẽ phát triển sau)
    openAddModel() {
        alert('Feature: Open Add Car Model Dialog (Coming soon)');
    }

    openEditModel(model: CarModel) {
        alert('Feature: Edit Model: ' + model.carName);
    }
}