import { Component, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogModule, Dialog } from '@angular/cdk/dialog'; // Import thêm Dialog

@Component({
    selector: 'app-certificate-detail-dialog',
    standalone: true,
    imports: [CommonModule, DialogModule],
    templateUrl: './certificate-detail-dialog.component.html'
})
export class CertificateDetailDialogComponent {

    constructor(
        private dialog: Dialog, // Inject Dialog Service thay vì DialogRef
        @Optional() @Inject(DIALOG_DATA) public data: any
    ) {
        if (!this.data) {
            this.data = { title: 'Certificate', status: 'Unknown' };
        }
    }

    close() {
        // Đóng tất cả dialog đang mở (Cách này chắc chắn hoạt động)
        this.dialog.closeAll();
    }

    download() {
        alert('Downloading certificate: ' + (this.data?.title || 'Document'));
    }
}