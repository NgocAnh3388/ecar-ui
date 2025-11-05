import { Injectable, Injector, inject } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ToastContainerComponent, ToastItem } from './toast-container.component';
import {ToastConfig, ToastPosition} from "./toast.type";
import {ToastRef} from "./toast.token";

@Injectable({ providedIn: 'root' })
export class ToastService {
    private overlay = inject(Overlay);
    private injector = inject(Injector);

    // Một overlay container cho mỗi vị trí
    private containers = new Map<ToastPosition, { ref: OverlayRef, comp: ToastContainerComponent }>();

    open(config: ToastConfig) {
        const pos = config.position ?? 'top-right';
        const { ref, comp } = this.ensureContainer(pos);

        const toastRef = new ToastRef(() => this.remove(comp, id));
        const id = crypto.randomUUID();
        comp.add({ id, config: { closable: true, ...config }, ref: toastRef });

        // Đóng khi ToastRef phát close
        toastRef.closed$.subscribe(() => this.remove(comp, id));

        return toastRef;
    }

    success(message: string, partial: Partial<ToastConfig> = {}) {
        return this.open({ message, variant: 'success', ...partial });
    }
    info(message: string, partial: Partial<ToastConfig> = {}) {
        return this.open({ message, variant: 'info', ...partial });
    }
    warning(message: string, partial: Partial<ToastConfig> = {}) {
        return this.open({ message, variant: 'warning', ...partial });
    }
    error(message: string, partial: Partial<ToastConfig> = {}) {
        return this.open({ message, variant: 'error', ...partial });
    }

    // Helpers
    private ensureContainer(position: ToastPosition) {
        const existing = this.containers.get(position);
        if (existing) return existing;

        const overlayRef = this.overlay.create(this.configFor(position));
        const portal = new ComponentPortal(ToastContainerComponent, null, this.injector);
        const compRef = overlayRef.attach(portal);
        const comp = compRef.instance;

        const value = { ref: overlayRef, comp };
        this.containers.set(position, value);
        return value;
    }

    private configFor(position: ToastPosition): OverlayConfig {
        const pos = this.overlay.position().global();
        const margin = '16px';

        switch (position) {
            case 'top-left':     pos.top(margin).left(margin); break;
            case 'top-right':    pos.top(margin).right(margin); break;
            case 'bottom-left':  pos.bottom(margin).left(margin); break;
            case 'bottom-right': pos.bottom(margin).right(margin); break;
        }
        return new OverlayConfig({
            hasBackdrop: false,
            scrollStrategy: this.overlay.scrollStrategies.noop(),
            positionStrategy: pos,
            panelClass: ['toast-pane'] // để custom thêm nếu cần
        });
    }

    private remove(container: ToastContainerComponent, id: string) {
        container.remove(id);
    }
}
