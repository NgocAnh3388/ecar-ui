import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { TokenStorageService } from '../../../../services/token-storage.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, DropdownComponent, DropdownItemTwoComponent],
})
export class UserDropdownComponent implements OnInit {
  isOpen = false;
  user: any;

  constructor(
    private tokenStorageService: TokenStorageService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.tokenStorageService.getUser();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  /** ✅ Gọi khi người dùng click “Sign out” */
  onLogout(): void {
    this.auth.logout(); // Xóa user + chuyển hướng về /index
  }
}
