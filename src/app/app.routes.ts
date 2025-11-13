import { Routes } from '@angular/router';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { LandingShellComponent } from './features/landing/landing-shell/landing-shell.component';
import { UserManagementComponent } from './pages/management/user-management/user-management.component';
import { AuthGuard } from './guard/auth.guard';
import {CustomerPaymentDashboardComponent} from './pages/dashboard/customer-payment-dashboard/customer-payment-dashboard.component';
import { PaypalSuccessComponent } from './pages/paypal-success/paypal-success.component';
import { ServiceDashboardComponent } from './pages/dashboard/service-dashboard/service-dashboard.component';
import { CustomerScheduleComponent } from './pages/dashboard/customer-schedule/customer-schedule.component';
import { CustomerMaintenanceComponent } from './pages/dashboard/customer-maintenance/customer-maintenance.component';
import { PaymentCancelComponent } from './pages/payment-cancel/payment-cancel.component';


export const routes: Routes = [
  // ✅ Protected routes (login required)
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
        title: 'Angular Ecommerce Dashboard | TailAdmin - Angular Admin Dashboard Template',
      },

      // ✅ Profile
      { path: 'profile/me', component: ProfileComponent, title: 'Thông tin cá nhân' },
      { path: 'profile/:id', component: ProfileComponent, title: 'Hồ sơ người dùng' },

      // ✅ Customer area
      { path: 'customer-schedule', component: CustomerScheduleComponent, title: 'Đặt lịch' },
      { path: 'customer-maintenance', component: CustomerMaintenanceComponent, title: 'Lịch sử bảo dưỡng' },
      { path: 'customer-payment-dashboard', component: CustomerPaymentDashboardComponent, title: 'Quản lý gói dịch vụ' },

      // ✅ Service & admin area
      { path: 'service-dashboard', component: ServiceDashboardComponent, title: 'Service Dashboard' },
      {
        path: 'admin/parts-management',
        loadChildren: () =>
          import('./pages/parts-management/parts-management.module').then(
            (m) => m.PartsManagementModule
          ),
        title: 'Quản lý phụ tùng & tồn kho',
      },
      { path: 'users', component: UserManagementComponent, title: 'Quản lý người dùng' },

      // ✅ UI Samples (giữ nguyên của template)
      { path: 'form-elements', component: FormElementsComponent, title: 'Form Elements' },
      { path: 'basic-tables', component: BasicTablesComponent, title: 'Basic Tables' },
      { path: 'blank', component: BlankComponent, title: 'Blank Page' },
      { path: 'invoice', component: InvoicesComponent, title: 'Invoice' },
      { path: 'alerts', component: AlertsComponent, title: 'Alerts' },
      { path: 'avatars', component: AvatarElementComponent, title: 'Avatars' },
      { path: 'badge', component: BadgesComponent, title: 'Badges' },
      { path: 'buttons', component: ButtonsComponent, title: 'Buttons' },
      { path: 'images', component: ImagesComponent, title: 'Images' },
      { path: 'videos', component: VideosComponent, title: 'Videos' },
    ],
  },

    {
        path: 'paypal/cancel',
        component: PaymentCancelComponent,
        title: 'Payment Canceled'
    },


  // ✅ PayPal callback
  { path: 'paypal/success', component: PaypalSuccessComponent, title: 'Thanh toán thành công' },
  { path: 'paypal/cancel', component: PaypalSuccessComponent, title: 'Thanh toán bị hủy' },

  // ✅ Auth pages
  { path: 'signin', component: SignInComponent, title: 'Đăng nhập' },
  { path: 'signup', component: SignUpComponent, title: 'Đăng ký' },
  { path: 'index', component: LandingShellComponent, title: 'Trang chủ' },

  // ✅ Error page
  { path: '**', component: NotFoundComponent, title: 'Không tìm thấy trang' },
];
