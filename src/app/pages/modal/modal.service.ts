import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ModalRef } from './modal-ref';
import {MODAL_DATA} from "./modal.token";

export interface ModalOpenOptions {
    data?: any;
    hasBackdrop?: boolean;
    backdropClass?: string | string[];
    panelClass?: string | string[];
    disableClose?: boolean; // chặn ESC & click backdrop
    maxWidth?: string;
    maxHeight?: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
    constructor(private overlay: Overlay, private injector: Injector) {}

    open<T, R = any>(component: any, options: ModalOpenOptions = {}): ModalRef<R> {
        const overlayRef = this.overlay.create(this.createConfig(options));
        const modalRef = new ModalRef<R>(() => overlayRef.dispose());

        // backdrop/ESC close
        if (!options.disableClose) {
            overlayRef.backdropClick().subscribe(() => modalRef.close());
            overlayRef.keydownEvents().subscribe(ev => {
                if (ev.key === 'Escape') modalRef.close();
            });
        }

        // truyền data + modalRef vào component
        const injector = Injector.create({
            parent: this.injector,
            providers: [
                { provide: MODAL_DATA, useValue: options.data },
                { provide: ModalRef, useValue: modalRef },
            ],
        });

        const portal = new ComponentPortal<T>(component, null, injector);
        overlayRef.attach(portal);

        return modalRef;
    }

    private createConfig(opts: ModalOpenOptions): OverlayConfig {
        return new OverlayConfig({
            hasBackdrop: opts.hasBackdrop ?? true,
            backdropClass: opts.backdropClass ?? 'modal-backdrop',
            panelClass: opts.panelClass ?? 'modal-panel',
            maxWidth: opts['maxWidth'] ?? 'calc(100vw - 32px)',
            maxHeight: opts['maxHeight'] ?? 'calc(100vh - 32px)',
            scrollStrategy: this.overlay.scrollStrategies.block(),
            positionStrategy: this.overlay.position().global()
                .centerHorizontally().centerVertically(),
        });
    }
}
