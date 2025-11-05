// toast-container.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './toast.component';
import {ToastConfig} from "./toast.type";
import {ToastRef} from "./toast.token";

export interface ToastItem { id: string; config: ToastConfig; ref: ToastRef; }

@Component({
    standalone: true,
    selector: 'app-toast-container',
    imports: [CommonModule, ToastComponent],
    template: `
  <div class="toast-stack">
    <ng-container *ngFor="let t of items(); trackBy: trackById">
      <app-toast [config]="t.config" [ref]="t.ref" (requestClose)="remove(t.id)"></app-toast>
    </ng-container>
  </div>
  `,
    styles: [`
    :host { pointer-events: none; }
    .toast-stack {
      display: flex; flex-direction: column; gap: 8px;
      max-width: min(92vw, 420px);
      pointer-events: none;
    }
  `]
})
export class ToastContainerComponent {
    items = signal<ToastItem[]>([]);
    add(item: ToastItem) { this.items.update(arr => [item, ...arr]); } // push on top
    remove(id: string)   { this.items.update(arr => arr.filter(x => x.id !== id)); }
    trackById = (_: number, it: ToastItem) => it.id;
}
