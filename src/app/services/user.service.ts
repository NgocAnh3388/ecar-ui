import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../models/user';
import { UserSearch } from '../models/user-search';
import { UserDto } from '../models/user-dto';

@Injectable({ providedIn: 'root' })
export class UserService {
    private api = 'http://localhost:8080';

    constructor(private http: HttpClient) {}

    // --- HÀM CẦN THÊM ---
    getAllUsers(): Observable<any[]> {
        // Gọi API lấy danh sách users
        return this.http.get<any[]>(`${this.api}/api/users`, { withCredentials: true });
    }
    // --------------------

    me(): Observable<User> {
        return this.http.get<User>(`${this.api}/api/users/me`).pipe(
            map(res => new User(res))
        );
    }

    getInfo() {
        return this.http.get<any>(`${this.api}/api/users/info`);
    }

    searchUsers(searchValue: string, pageSize: number, pageNumber: number): Observable<any> {
        const userSearch = new UserSearch(searchValue, pageNumber, pageSize);
        return this.http.post<any>(`${this.api}/api/users/search`, userSearch);
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete<any>(`${this.api}/api/users/${id}`);
    }

    createUser(user: UserDto): Observable<any> {
        return this.http.post<any>(`${this.api}/api/users`, user);
    }

    updateUser(id: number, user: UserDto): Observable<any> {
        return this.http.put<any>(`${this.api}/api/users/${id}`, user);
    }

    getUsersByRole(role: string): Observable<any> {
        return this.http.get<any>(`${this.api}/api/users/get-by-role/${role}`);
    }

    getUserById(id: string | number): Observable<User> {
        return this.http.get<User>(`${this.api}/api/users/${id}`).pipe(
            map(res => new User(res))
        );
    }

    toggleActive(id: number): Observable<void> {
        return this.http.put<void>(`${this.api}/api/users/${id}/toggle-active`, {});
    }

    getUserByEmail(email: string): Observable<UserDto> {
        // Gọi API search để tìm user theo email
        const userSearch = new UserSearch(email, 0, 1);
        return this.http.post<any>(`${this.api}/api/users/search`, userSearch).pipe(
            map(res => {
                if (res.content && res.content.length > 0) {
                    return res.content[0];
                }
                throw new Error('User not found');
            })
        );
    }

    // Hàm mới để lấy Tech theo Center
    getTechniciansByMyCenter(): Observable<any[]> {
        // Đường dẫn phải khớp với Controller Backend bạn đã tạo
        return this.http.get<any[]>(`${this.api}/api/users/technicians/my-center`, { withCredentials: true });
    }

    getCurrentUser(): Observable<any> {
        return this.http.get<any>(`${this.api}/api/users/me`, { withCredentials: true });
    }

}
