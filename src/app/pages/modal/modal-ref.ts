import { Subject } from 'rxjs';

export class ModalRef<Result = any> {
    private readonly _afterClosed = new Subject<Result | undefined>();
    afterClosed$ = this._afterClosed.asObservable();

    constructor(private _dispose: () => void) {
    }

    close(result?: Result) {
        this._afterClosed.next(result);
        this._afterClosed.complete();
        this._dispose();
    }
}