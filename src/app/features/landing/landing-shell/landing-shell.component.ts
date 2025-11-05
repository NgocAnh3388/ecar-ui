import {
    Component, ElementRef, Renderer2, ViewEncapsulation,
    NgZone, AfterViewInit, OnDestroy, OnInit, signal
} from '@angular/core';
import {AuthService} from "../../../services/auth.service";
import {UserService} from "../../../services/user.service";
import {NgOptimizedImage} from "@angular/common";
import {TokenStorageService} from "../../../services/token-storage.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-landing-shell',
    standalone: true,
    templateUrl: './landing-shell.component.html',
    styleUrls: ['./landing-shell.component.css'],
    encapsulation: ViewEncapsulation.ShadowDom,
    imports: [
        NgOptimizedImage
    ],
    // Cô lập mạnh
})
export class LandingShellComponent implements AfterViewInit, OnDestroy, OnInit {

    user = signal<any | null>(null);
    loading = signal(true);

    ngOnInit() {
        this.refreshUser();
    }

    constructor(
        private el: ElementRef<HTMLElement>,
        private r2: Renderer2,
        private zone: NgZone,
        private auth: AuthService,
        private userSvc: UserService,
        private tokenStorageService: TokenStorageService,
        private router: Router,
    ) {}

    async ngAfterViewInit() {
        const root = this.el.nativeElement.shadowRoot!;
        await this.zone.runOutsideAngular(async () => {
            // 1) jQuery trước
            await this.loadScript('https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js', root);

            // 2) (tuỳ) Bootstrap JS nếu bạn dùng dropdown/modal/toast của Bootstrap
            await this.loadScript('https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js', root);

            // 3) Owl Carousel (lib cần thiết)
            await this.loadScript('../../../../assets/landing/lib/owlcarousel/owl.carousel.min.js', root);

            // 4) main.js đã SCOPED (phiên bản mình cung cấp)
            await this.loadScript('../../../../assets/landing/js/main.js', root);

            // 5) Gọi init scoped
            const $ = (window as any).jQuery;
            (window as any).Landing?.initLanding(root, $);
        });
    }

    ngOnDestroy(): void {
        // Hủy listeners/IO/Owl khi component bị remove
        (window as any).Landing?.destroyLanding?.();
    }

    private loadScript(src: string, target: ShadowRoot | HTMLElement): Promise<void> {
        return new Promise((resolve, reject) => {
            const s = this.r2.createElement('script');
            s.type = 'text/javascript';
            s.src = src;
            s.defer = true;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('Failed to load ' + src));
            target.appendChild(s);
        });
    }

    refreshUser() {
        this.loading.set(true);
        this.userSvc.me().subscribe({
            next: (u) => {
                this.user.set(u);
                this.loading.set(false);
                this.tokenStorageService.saveUser(u)
            },
            error: () => {
                this.user.set(null);
                this.loading.set(false);
            }
        });
    }


    login() { this.auth.loginWithGoogle(); }
    logout() { this.auth.logout(); }
    goToDashboard() {
        this.router.navigate(['/']).then();
    }
}
