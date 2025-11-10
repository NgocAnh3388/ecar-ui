import {
  Component,
  ElementRef,
  Renderer2,
  ViewEncapsulation,
  NgZone,
  AfterViewInit,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { NgOptimizedImage } from '@angular/common';
import { TokenStorageService } from '../../../services/token-storage.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-shell',
  standalone: true,
  templateUrl: './landing-shell.component.html',
  styleUrls: ['./landing-shell.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom,
  imports: [NgOptimizedImage, RouterModule],
})
export class LandingShellComponent implements AfterViewInit, OnDestroy, OnInit {
  user = signal<any | null>(null);
  loading = signal(true);

  constructor(
    private el: ElementRef<HTMLElement>,
    private r2: Renderer2,
    private zone: NgZone,
    private auth: AuthService,
    private userSvc: UserService,
    private tokenStorageService: TokenStorageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.refreshUser();
  }

  async ngAfterViewInit() {
    const root = this.el.nativeElement.shadowRoot!;

    // ✅ Nạp JS bên ngoài (bootstrap, jquery, carousel...)
    await this.zone.runOutsideAngular(async () => {
      await this.loadScript('https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js', root);
      await this.loadScript('https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js', root);
      await this.loadScript('/assets/landing/lib/owlcarousel/owl.carousel.min.js', root);
      await this.loadScript('/assets/landing/js/main.js', root);
      const $ = (window as any).jQuery;
      (window as any).Landing?.initLanding(root, $);
    });

    // ✅ Bắt click thủ công (vì Shadow DOM không nhận routerLink)
    const signInBtn = root.querySelector('a[routerlink="/sign-in"]');
    const signUpBtn = root.querySelector('a[routerlink="/sign-up"]');

    if (signInBtn) {
      signInBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.zone.run(() => this.router.navigate(['/sign-in']));
      });
    }

    if (signUpBtn) {
      signUpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.zone.run(() => this.router.navigate(['/sign-up']));
      });
    }
  }

  ngOnDestroy(): void {
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

  // ============================================================
  // ✅ REFRESH USER (Hybrid FE + BE)
  // ============================================================
  refreshUser() {
    this.loading.set(true);

    // 🟢 1. FE MODE (login bằng Sign In / Sign Up)
    const localUser = this.auth.getUser();
    if (localUser && localUser.email) {
      this.user.set(localUser);
      this.tokenStorageService.saveUser(localUser);
      this.loading.set(false);
      return; // ⛔ Không gọi BE khi đã có user FE
    }

    // 🟡 2. BE MODE (login bằng Google OAuth2)
    this.userSvc.me().subscribe({
      next: (u) => {
        this.user.set(u);
        this.loading.set(false);
        this.tokenStorageService.saveUser(u);
      },
      error: () => {
        this.user.set(null);
        this.loading.set(false);
      },
    });
  }

  // ============================================================
  // ✅ LOGIN LOGOUT
  // ============================================================
  login() {
    this.auth.loginWithGoogle(); // Google login dùng BE thật
  }

  logout() {
    this.auth.logout();
  }

  goToDashboard() {
    this.router.navigate(['/']).then();
  }
}
