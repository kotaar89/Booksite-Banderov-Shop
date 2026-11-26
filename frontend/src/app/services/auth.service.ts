import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { User, Order } from '../models/book.model';
import { API_CONFIG } from '../config/api.config';

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

interface ProfileResponse {
  success: boolean;
  user: User;
  orders: Order[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = API_CONFIG.baseUrl;

  private currentUserSignal = signal<User | null>(this.getStoredUser());
  public currentUser = this.currentUserSignal.asReadonly();
  public isLoggedIn = computed(() => this.currentUserSignal() !== null);

  private getStoredUser(): User | null {
    try {
      const saved = localStorage.getItem('bookstore_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  // Настоящая регистрация в MySQL через PHP (api/auth/register.php)
  register(userData: { name: string; email: string; password: string; phone?: string; address?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register.php`, userData).pipe(
      tap(res => {
        if (res.success && res.user) {
          this.setSession(res.user, res.token);
        }
      }),
      catchError(err => {
        const errorMsg = err.error?.error || err.message || 'Ошибка сервера при регистрации';
        return throwError(() => errorMsg);
      })
    );
  }

  // Настоящий вход через MySQL (api/auth/login.php)
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login.php`, credentials).pipe(
      tap(res => {
        if (res.success && res.user) {
          this.setSession(res.user, res.token);
        }
      }),
      catchError(err => {
        const errorMsg = err.error?.error || 'Неверный email или пароль';
        return throwError(() => errorMsg);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('bookstore_user');
    localStorage.removeItem('bookstore_token');
    this.currentUserSignal.set(null);
  }

  // Обновление профиля в MySQL
  updateProfile(user: Partial<User>): Observable<any> {
    const current = this.currentUserSignal();
    const payload = { ...current, ...user };

    return this.http.post<{ success: boolean; user: User }>(`${this.apiUrl}/auth/profile.php`, payload).pipe(
      tap(res => {
        if (res.success) {
          const updated = { ...current, ...res.user } as User;
          this.setSession(updated);
        }
      })
    );
  }

  // Загрузка реального профиля и реальных заказов из MySQL (api/auth/profile.php)
  getProfile(userId: number): Observable<{ user: User; orders: Order[] }> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/auth/profile.php?user_id=${userId}`).pipe(
      map(res => ({
        user: res.user,
        orders: res.orders || []
      })),
      catchError(err => {
        // Если у пользователя пока нет заказов или возникла ошибка
        const currentUser = this.currentUserSignal() || {
          id: userId,
          name: '',
          email: ''
        };
        return [{ user: currentUser, orders: [] }];
      })
    );
  }

  private setSession(user: User, token?: string): void {
    localStorage.setItem('bookstore_user', JSON.stringify(user));
    if (token) {
      localStorage.setItem('bookstore_token', token);
    }
    this.currentUserSignal.set(user);
  }
}
