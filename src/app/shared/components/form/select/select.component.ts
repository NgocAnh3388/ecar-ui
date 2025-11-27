import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-select',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './select.component.html',
    // styleUrl: './select.component.css' <--- ĐÃ XÓA DÒNG NÀY
})
export class SelectComponent {
    @Input() options: { value: string | number; label: string }[] = [];
    @Input() value: string | number | null = null;
    @Input() placeholder: string = 'Select an option';
    @Input() disabled: boolean = false; // Quan trọng để fix lỗi NG8002

    @Output() valueChange = new EventEmitter<any>();

    isOpen = false;

    constructor(private elementRef: ElementRef) {}

    get selectedLabel(): string {
        const selected = this.options.find(opt => opt.value == this.value);
        return selected ? selected.label : this.placeholder;
    }

    toggle() {
        if (this.disabled) return;
        this.isOpen = !this.isOpen;
    }

    select(option: any) {
        if (this.disabled) return;
        this.value = option.value;
        this.valueChange.emit(option.value);
        this.isOpen = false;
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isOpen = false;
        }
    }
}