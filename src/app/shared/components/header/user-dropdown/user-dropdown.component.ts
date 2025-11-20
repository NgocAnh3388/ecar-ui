import { Component, OnInit } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
// BỎ Router đi vì AuthService sẽ tự chuyển hướng
// import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';

// BƯỚC 1: BỎ TokenStorageService
// import { TokenStorageService } from "../../../../services/token-storage.service";
// BƯỚC 2: IMPORT AuthService
import { AuthService } from "../../../../services/auth.service";

@Component({
    selector: 'app-user-dropdown',
    templateUrl: './user-dropdown.component.html',
    imports: [CommonModule, RouterModule, DropdownComponent, DropdownItemTwoComponent]
})
export class UserDropdownComponent implements OnInit {
    isOpen = false;
    user: any;

    constructor(
        // BƯỚC 3: Thay thế Service trong constructor
        // private tokenStorageService: TokenStorageService,
        private authService: AuthService,
        // private router: Router // Bỏ router
    ) {}

    ngOnInit(): void {
        // BƯỚC 4: Lấy user từ AuthService (localStorage)
        // this.user = this.tokenStorageService.getUser();
        this.user = this.authService.getUser();
    }

    toggleDropdown() {
        this.isOpen = !this.isOpen;
    }

    closeDropdown() {
        this.isOpen = false;
    }

    logout() {
        // BƯỚC 5: Gọi hàm logout chính xác từ AuthService
        // this.tokenStorageService.signOut();
        // this.router.navigate(['/index']);
        this.authService.logout();
    }
}