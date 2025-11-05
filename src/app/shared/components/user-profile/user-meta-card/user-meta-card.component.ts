import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { User } from '../../../../models/user';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-user-meta-card',
  imports: [
    CommonModule,
    ModalComponent,
    InputFieldComponent,
    ButtonComponent,
    FormsModule,
  ],
  templateUrl: './user-meta-card.component.html',
  styles: ``
})
export class UserMetaCardComponent {
  @Input() user!: User;

  isOpen = false;
  constructor(public modal: ModalService) {}

  openModal() { this.isOpen = true; }
  closeModal() { this.isOpen = false; }

  handleSave() {
    console.log('Save clicked', this.user);
    this.modal.closeModal();
    // TODO: gọi backend update user nếu cần
  }
}
