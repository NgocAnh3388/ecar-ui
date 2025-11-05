import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { User } from '../../../../models/user';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-user-info-card',
  imports: [
    CommonModule,
    InputFieldComponent,
    ButtonComponent,
    LabelComponent,
    ModalComponent,
    FormsModule,
  ],
  templateUrl: './user-info-card.component.html',
  styles: ``
})
export class UserInfoCardComponent {
  @Input() user!: User;

  isOpen = false;
  constructor(public modal: ModalService) {}

  openModal() { this.isOpen = true; }
  closeModal() { this.isOpen = false; }
}
