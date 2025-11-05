export type ToastVariant = 'success' | 'info' | 'warning' | 'error';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface ToastConfig {
    message: string;
    title?: string;
    variant?: ToastVariant;
    duration?: number;       // ms, default 2500; 0 = không auto close
    closable?: boolean;      // default true
    actionText?: string;     // vd: 'Retry'
    onAction?: () => void;
    position?: ToastPosition; // default 'top-right'
}
