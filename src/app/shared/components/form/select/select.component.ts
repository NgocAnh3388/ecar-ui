import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms'; // ✅ Đã thêm import quan trọng

export interface Option {
    value: string;
    label: string;
}

@Component({
    selector: 'app-select',
    imports: [CommonModule, FormsModule], // ✅ Đã thêm FormsModule
    templateUrl: './select.component.html',
})
export class SelectComponent implements OnInit, OnChanges { // ✅ Thêm OnChanges
    @Input() options: Option[] = [];
    @Input() placeholder: string = 'Select an option';
    @Input() className: string = '';
    @Input() defaultValue: string = '';
    @Input() value: string = '';

    @Output() valueChange = new EventEmitter<string>();

    ngOnInit() {
        if (!this.value && this.defaultValue) {
            this.value = this.defaultValue;
        }
    }

    // ✅ CẬP NHẬT QUAN TRỌNG:
    // Giúp component nhận giá trị mới nếu component cha thay đổi
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['value'] && !changes['value'].firstChange) {
            this.value = changes['value'].currentValue;
        }
    }

    // ✅ Cập nhật: Hàm này được thiết kế để dùng với (ngModelChange)
    // event ở đây chính là giá trị (value), không phải object (event: Event)
    onChange(event: any) {
        console.log(event);
        this.value = event;
        this.valueChange.emit(event);
    }
}