import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { AdminUsersComponent } from './admin-users.component';
import { UserService } from '../../../../services/user.service';

class UserServiceStub {
  private subject = new Subject<any[]>();
  getAllUsers() {
    return this.subject.asObservable();
  }
  emit(users: any[]) {
    this.subject.next(users);
  }
}

function makeUsers() {
  return [
    { id: 1, email: 'admin@example.com', fullName: 'Admin User', roles: [{ name: 'ADMIN' }] },
    { id: 2, email: 'manager@example.com', fullName: 'Manager User', roles: [{ name: 'MANAGER' }] },
    { id: 3, email: 'tech@example.com', fullName: 'Tech One', roles: [{ name: 'TECHNICIAN' }] },
    { id: 4, email: 'user1@example.com', fullName: 'Regular User', roles: ['CUSTOMER'] },
    { id: 5, email: 'another@example.com', fullName: 'Another Admin', roles: [{ name: 'ADMIN' }] },
    { id: 6, email: 'alpha@example.com', fullName: 'Alpha', roles: [{ name: 'ADMIN' }] },
    { id: 7, email: 'beta@example.com', fullName: 'Beta', roles: [{ name: 'ADMIN' }] },
    { id: 8, email: 'gamma@example.com', fullName: 'Gamma', roles: [{ name: 'ADMIN' }] },
    { id: 9, email: 'delta@example.com', fullName: 'Delta', roles: [{ name: 'ADMIN' }] },
    { id: 10, email: 'epsilon@example.com', fullName: 'Epsilon', roles: [{ name: 'ADMIN' }] },
    { id: 11, email: 'zeta@example.com', fullName: 'Zeta', roles: [{ name: 'ADMIN' }] },
  ];
}

describe('AdminUsersComponent', () => {
  let component: AdminUsersComponent;
  let service: UserServiceStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminUsersComponent,
        { provide: UserService, useClass: UserServiceStub },
      ],
    });

    component = TestBed.inject(AdminUsersComponent);
    service = TestBed.inject(UserService) as unknown as UserServiceStub;
  });

  it('should load users on init and apply default pagination', () => {
    component.pageSize = 10;
    component.ngOnInit();

    const users = makeUsers();
    service.emit(users);

    expect(component.allUsers.length).toBe(users.length);
    expect(component.totalPages).toBe(Math.ceil(users.length / component.pageSize));
    expect(component.users.length).toBe(10);
    expect(component.users[0].email).toBe('admin@example.com');
  });

  it('should filter by role when filterRole is called', () => {
    component.ngOnInit();
    const users = makeUsers();
    service.emit(users);

    component.filterRole('ADMIN');

    // Expect only ADMIN roles in the current page
    expect(component.users.every(u => (u.roles[0]?.name || u.roles[0]) === 'ADMIN')).toBeTrue();
    expect(component.pageIndex).toBe(0);
  });

  it('should filter by search value (email or fullName)', () => {
    component.ngOnInit();
    service.emit(makeUsers());

    component.searchValue = 'tech';
    component.onSearch();

    expect(component.users.length).toBeGreaterThan(0);
    expect(component.users.every(u => (u.email + u.fullName).toLowerCase().includes('tech'))).toBeTrue();
  });

  it('should paginate results correctly', () => {
    component.pageSize = 5;
    component.ngOnInit();
    service.emit(makeUsers());

    // Page 0
    expect(component.users.length).toBe(5);
    expect(component.pageIndex).toBe(0);

    // Go to page 1
    component.onPageChange(1);
    expect(component.pageIndex).toBe(1);
    expect(component.users.length).toBe(5);

    // Go to last page
    const lastPage = component.totalPages - 1;
    component.onPageChange(lastPage);
    const remaining = makeUsers().length - lastPage * component.pageSize;
    expect(component.users.length).toBe(remaining);
  });

  it('should combine role and search filters', () => {
    component.pageSize = 10;
    component.ngOnInit();
    service.emit(makeUsers());

    component.filterRole('ADMIN');
    component.searchValue = 'another';
    component.onSearch();

    expect(component.users.length).toBe(1);
    expect(component.users[0].email).toBe('another@example.com');
  });
});
