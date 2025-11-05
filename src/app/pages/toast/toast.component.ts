// toast.component.ts
import { Component, EventEmitter, Input, Output, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ToastConfig} from "./toast.type";
import {ToastRef} from "./toast.token";

@Component({
    standalone: true,
    selector: 'app-toast',
    imports: [CommonModule],
    template: `
  <div class="toast"
       [class.toast--success]="config.variant==='success'"
       [class.toast--info]="config.variant==='info'"
       [class.toast--warning]="config.variant==='warning'"
       [class.toast--error]="config.variant==='error'"
       (mouseenter)="pause()" (mouseleave)="resume()">
    <div class="toast__body">
      <div class="toast__text">
        <div *ngIf="config.title" class="toast__title">{{config.title}}</div>
        <div class="toast__message">{{config.message}}</div>
      </div>
      <div class="toast__actions" *ngIf="config.actionText">
        <button class="toast__btn" (click)="runAction($event)">{{config.actionText}}</button>
      </div>
      <button *ngIf="config.closable!==false" class="toast__close" (click)="close($event)">✕</button>
    </div>
  </div>
  `,
    styles: [`
    .toast {
      pointer-events: auto;
      border-radius: 12px; padding: 12px 14px; background: #111; color: #fff;
      box-shadow: 0 8px 30px rgba(0,0,0,.25); overflow: hidden;
      animation: fadeIn .15s ease-out;
    }
    .toast--success { background: #0c5132; }
    .toast--info    { background: #0b3a5b; }
    .toast--warning { background: #7a4d00; }
    .toast--error   { background: #6b1111; }

    .toast__body { display: grid; grid-template-columns: 1fr auto auto; align-items: start; gap: 8px; }
    .toast__title { font-weight: 600; margin-bottom: 2px; }
    .toast__message { opacity: .95; }
    .toast__btn { background: rgba(255,255,255,.12); border: none; color: #fff; padding: 6px 10px; border-radius: 8px; cursor: pointer; }
    .toast__btn:hover { background: rgba(255,255,255,.18); }
    .toast__close { background: transparent; border: none; color: #fff; opacity: .7; cursor: pointer; line-height: 1; }
    .toast__close:hover { opacity: 1; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px);} to { opacity: 1; transform: translateY(0);} }
  `]
})
export class ToastComponent {
    @Input() config!: ToastConfig;
    @Input() ref!: ToastRef;
    @Output() requestClose = new EventEmitter<void>();

    private timer: any;
    private remaining = 0;
    private startedAt = 0;

    ngOnInit() { this.startAutoClose(); }
    ngOnDestroy() { clearTimeout(this.timer); }

    private startAutoClose() {
        const d = this.config?.duration ?? 2500;
        if (!d || d <= 0) return;
        this.remaining = d;
        this.startedAt = Date.now();
        this.timer = setTimeout(() => this.requestClose.emit(), d);
    }
    pause() {
        if (!this.timer) return;
        clearTimeout(this.timer);
        this.timer = null;
        this.remaining -= (Date.now() - this.startedAt);
    }
    resume() {
        if (this.timer || !this.remaining || this.remaining <= 0) return;
        this.startedAt = Date.now();
        this.timer = setTimeout(() => this.requestClose.emit(), this.remaining);
    }
    close(ev: MouseEvent) { ev.stopPropagation(); this.requestClose.emit(); }
    runAction(ev: MouseEvent) {
        ev.stopPropagation();
        try { this.config?.onAction?.(); } finally { this.requestClose.emit(); }
    }
}
