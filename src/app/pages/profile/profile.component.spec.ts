import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../modal/modal.service';
import { VehicleService } from '../../services/vehicle.service';
import { ToastService } from '../../pages/toast/toast.service';

// Simple fakes/mocks
class ActivatedRouteMock {
  private paramMapSubject = new Subject<ParamMap>();
  paramMap = this.paramMapSubject.asObservable();
  setParams(map: ParamMap) { this.paramMapSubject.next(map); }
}

class UserServiceMock {
  me = jasmine.createSpy('me');
  getUserById = jasmine.createSpy('getUserById');
  updateUser = jasmine.createSpy('updateUser');
}

class AuthServiceMock {
  getRoles = jasmine.createSpy('getRoles');
}

class ModalRefMock<T = any> {
  afterClosed$ = new Subject<T>();
}

class ModalServiceMock {
  open = jasmine.createSpy('open').and.callFake(() => new ModalRefMock());
}

class VehicleServiceMock {
  addVehicle = jasmine.createSpy('addVehicle');
}

class ToastServiceMock {
  success = jasmine.createSpy('success');
  error = jasmine.createSpy('error');
}

// Utilities
function createParamMap(params: Record<string, any>): ParamMap {
  return {
    keys: Object.keys(params),
    get: (name: string) => params[name] ?? null,
    getAll: (name: string) => (params[name] ? [params[name]] : []),
    has: (name: string) => params[name] !== undefined,
  } as any;
}

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  let route: ActivatedRouteMock;
  let userService: UserServiceMock;
  let authService: AuthServiceMock;
  let modal: ModalServiceMock;
  let toast: ToastServiceMock;
  let vehicleService: VehicleServiceMock;

  beforeEach(async () => {
    route = new ActivatedRouteMock();
    userService = new UserServiceMock();
    authService = new AuthServiceMock();
    modal = new ModalServiceMock();
    toast = new ToastServiceMock();
    vehicleService = new VehicleServiceMock();

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: UserService, useValue: userService },
        { provide: AuthService, useValue: authService },
        { provide: ModalService, useValue: modal },
        { provide: ToastService, useValue: toast },
        { provide: VehicleService, useValue: vehicleService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;

    // default role
    authService.getRoles.and.returnValue(['ROLE_CUSTOMER']);
  });

  afterEach(() => {
    localStorage.removeItem('user');
  });

  it('should load current user on init for non-admin and set localStorage', fakeAsync(() => {
    const meResponse: any = { id: 123, vehicles: [], roles: ['CUSTOMER'] };
    userService.me.and.returnValue(of(meResponse));

    component.ngOnInit();
    tick();

    expect(userService.me).toHaveBeenCalled();
    expect(component.userData).toEqual(meResponse);
    expect(component.userId).toBe('123');
    expect(component.isLoading).toBeFalse();
    expect(JSON.parse(localStorage.getItem('user') || '{}')).toEqual(meResponse);
    flush();
  }));

  it('should load user by id when admin and id param present', fakeAsync(() => {
    authService.getRoles.and.returnValue(['ROLE_ADMIN']);
    const user: any = { id: 456, vehicles: [], roles: ['CUSTOMER'] };
    userService.getUserById.and.returnValue(of(user));

    component.ngOnInit();
    // emit route param id
    route.setParams(createParamMap({ id: '456' }));
    tick();

    expect(userService.getUserById).toHaveBeenCalledWith('456');
    expect(component.userData).toEqual(user);
    expect(component.isLoading).toBeFalse();
    flush();
  }));

  it('should fallback to loadMe when admin but no id param', fakeAsync(() => {
    authService.getRoles.and.returnValue(['ROLE_ADMIN']);
    const meResponse: any = { id: 789, vehicles: [], roles: ['CUSTOMER'] };
    userService.me.and.returnValue(of(meResponse));

    component.ngOnInit();
    // emit with null id
    route.setParams(createParamMap({} as any));
    tick();

    expect(userService.me).toHaveBeenCalled();
    expect(component.userId).toBe('789');
    expect(component.isLoading).toBeFalse();
    flush();
  }));

  it('should show error toast and stop loading when update profile fails', fakeAsync(() => {
    // prepare state
    (component as any).userId = '321';
    component.userData = { vehicles: [], roles: ['CUSTOMER'] } as any;

    userService.updateUser.and.returnValue(throwError(() => ({ error: { message: 'fail' } })));

    component.handleUpdateUser({ email: 'a@b.com', fullName: 'A', phoneNo: '1' });
    tick();

    expect(userService.updateUser).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Failed to update profile.');
    expect(component.isLoading).toBeFalse();
    flush();
  }));

  it('should add vehicle and reload on success, toast success on create', fakeAsync(() => {
    spyOn(component as any, 'loadProfileData');
    vehicleService.addVehicle.and.returnValue(of({}));

    component.handleCreateVehicle({ model: 'X' });
    tick();

    expect(vehicleService.addVehicle).toHaveBeenCalledWith({ model: 'X' });
    expect(toast.success).toHaveBeenCalledWith('Vehicle added successfully!');
    expect((component as any).loadProfileData).toHaveBeenCalled();
    flush();
  }));

  it('should show specific error message from backend when add vehicle fails', fakeAsync(() => {
    vehicleService.addVehicle.and.returnValue(throwError(() => ({ error: { message: 'Duplicate plate' } })));

    component.handleCreateVehicle({});
    tick();

    expect(toast.error).toHaveBeenCalledWith('Duplicate plate');
    expect(component.isLoading).toBeFalse();
    flush();
  }));

  it('should open edit profile dialog and call update when closed with data', fakeAsync(() => {
    const modalRef = new ModalRefMock<any>();
    modal.open.and.returnValue(modalRef as any);

    spyOn(component as any, 'handleUpdateUser');

    component.editProfile();

    // simulate dialog closing with payload
    modalRef.afterClosed$.next({ email: 'e', fullName: 'f', phoneNo: 'p' });
    tick();

    expect(modal.open).toHaveBeenCalled();
    expect((component as any).handleUpdateUser).toHaveBeenCalled();
    flush();
  }));
});
