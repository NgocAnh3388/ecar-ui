import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-technician-profile',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './technician-profile.component.html',
    styleUrls: ['./technician-profile.component.css']
})
export class TechnicianProfileComponent implements OnInit {

    currentUser: any = null;
    filterStatus: string = 'ALL';
    searchTerm: string = '';

    // Mock statistics
    stats = {
        yearsExperience: 5,
        completedServices: 1240,
        trainingHours: 86,
        rating: 4.9
    };

    // Mock certificates data
    certificates = [
        {
            id: 1,
            title: 'ASE Certification - Master Technician',
            issuer: 'Automotive Service Excellence',
            date: '2023-12-01',
            expiryDate: '2028-12-01',
            status: 'Valid',
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqgC-jYhqx7C6k9vJbBq8gq5Q5Q5Q5Q5Q5Q5&s'
        },
        {
            id: 2,
            title: 'High Voltage Safety Level 2',
            issuer: 'Ecar Training Center',
            date: '2024-01-15',
            expiryDate: '2025-02-20', // Expiring soon
            status: 'Expiring Soon',
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqgC-jYhqx7C6k9vJbBq8gq5Q5Q5Q5Q5Q5&s'
        },
        {
            id: 3,
            title: 'VinFast VF8/VF9 Systems Expert',
            issuer: 'VinFast Academy',
            date: '2023-06-10',
            expiryDate: '2026-06-10',
            status: 'Valid',
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqgC-jYhqx7C6k9vJbBq8gq5Q5Q5Q5Q5Q5&s'
        },
        {
            id: 4,
            title: 'First Aid & Workplace Safety',
            issuer: 'Red Cross',
            date: '2022-01-01',
            expiryDate: '2024-01-01', // Expired
            status: 'Expired',
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqgC-jYhqx7C6k9vJbBq8gq5Q5Q5Q5Q5Q5&s'
        },
        {
            id: 5,
            title: 'Electric Motor Diagnostics',
            issuer: 'Bosch Automotive',
            date: '2024-05-20',
            expiryDate: '2029-05-20',
            status: 'Valid',
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqgC-jYhqx7C6k9vJbBq8gq5Q5Q5Q5Q5Q5&s'
        }
    ];

    // Displayed list after filtering
    displayedCertificates = [...this.certificates];

    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.authService.getCurrentUser().subscribe({
            next: (user) => {
                this.currentUser = user;
            },
            error: (err) => console.error('Failed to load user profile', err)
        });
        this.applyFilter();
    }

    onUpload() {
        alert("Upload feature is under development!");
    }

    onViewCert(cert: any) {
        alert(`Viewing details for: ${cert.title}\nStatus: ${cert.status}`);
    }

    // Filter logic
    applyFilter() {
        this.displayedCertificates = this.certificates.filter(cert => {
            const matchesSearch = cert.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                cert.issuer.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesStatus = this.filterStatus === 'ALL' || cert.status === this.filterStatus;

            return matchesSearch && matchesStatus;
        });
    }
}