import {
    CanActivate,
    Router,
    UrlTree
} from "@angular/router";
import {Injectable} from "@angular/core";
import {catchError, Observable, map, of, finalize, tap} from "rxjs";
import {UserService} from "../services/user.service";
import {TokenStorageService} from "../services/token-storage.service";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private router: Router,
                private userService: UserService,
                private tokenStorageService: TokenStorageService,) {}

    canActivate(): Observable<boolean | UrlTree> {
        return this.userService.me().pipe(
            tap(resp => this.tokenStorageService.saveUser(resp)),
            map(() => true),
            catchError(() => of(this.router.createUrlTree(['index'])))
        );
    }
}