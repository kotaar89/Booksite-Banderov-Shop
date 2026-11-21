import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
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

  register(userData: { name: string; email: string; password: string; phone?: string; address?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register.php`, userData).pipe(
      tap(res => {
        if (res.success && res.user) {
          this.setSession(res.user, res.token);
        }
      }),
      catchError(err => {
        // Fallback если PHP сервер выключен (для демо)
        if (err.status === 0 || err.status === 404) {
          console.warn('Сервер PHP не отвечает, используем локальную регистрацию для тестирования');
          const mockUser: User = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '+7 (999) 000-00-00',
            address: userData.address || 'г. Москва'
          };
          this.setSession(mockUser, 'demo_token_' + Date.now());
          return of({ success: true, user: mockUser, token: 'demo_token' });
        }
        return throwError(() => err.error?.error || 'Ошибка при регистрации');
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login.php`, credentials).pipe(
      tap(res => {
        if (res.success && res.user) {
          this.setSession(res.user, res.token);
        }
      }),
      catchError(err => {
        // Fallback если PHP сервер выключен (тестовый аккаунт)
        if (err.status === 0 || err.status === 404) {
          console.warn('Сервер PHP не отвечает, используем локальный вход для тестирования');
          if (credentials.email === 'test@example.com' && credentials.password === '123456') {
            const demoUser: User = {
              id: 1,
              name: 'Анна Смирнова',
              email: 'test@example.com',
              phone: '+7 (999) 123-45-67',
              address: 'г. Москва, ул. Ленина, д. 10, кв. 25'
            };
            this.setSession(demoUser, 'demo_token_123');
            return of({ success: true, user: demoUser, token: 'demo_token_123' });
          }
        }
        return throwError(() => err.error?.error || 'Неверный email или пароль');
      })
    );
  }

  logout(): void {
    localStorage.removeItem('bookstore_user');
    localStorage.removeItem('bookstore_token');
    this.currentUserSignal.set(null);
  }

  updateProfile(user: Partial<User>): Observable<any> {
    const current = this.currentUserSignal();
    const payload = { ...current, ...user };

    return this.http.post<{ success: boolean; user: User }>(`${this.apiUrl}/auth/profile.php`, payload).pipe(
      tap(res => {
        if (res.success) {
          const updated = { ...current, ...res.user } as User;
          this.setSession(updated);
        }
      }),
      catchError(err => {
        console.warn('Обновление в локальном режиме', err);
        const updated = { ...current, ...user } as User;
        this.setSession(updated);
        return of({ success: true, user: updated });
      })
    );
  }

  getProfile(userId: number): Observable<{ user: User; orders: Order[] }> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/auth/profile.php?user_id=${userId}`).pipe(
      map(res => ({ user: res.user, orders: res.orders })),
      catchError(err => {
        console.warn('Не удалось загрузить профиль с сервера, используем локальные данные', err);
        const user = this.currentUserSignal() || {
          id: userId,
          name: 'Анна Смирнова',
          email: 'test@example.com',
          phone: '+7 (999) 123-45-67',
          address: 'г. Москва, ул. Ленина, д. 10, кв. 25'
        };
        const orders: Order[] = [
          {
            id: 101,
            user_id: userId,
            customer_name: user.name,
            customer_phone: user.phone || '',
            delivery_address: user.address || '',
            payment_method: 'Банковской картой онлайн',
            total_amount: 1570,
            status: 'Доставлен',
            created_at: '2026-11-15 14:30',
            items: [
              { title: 'Мастер и Маргарита', price: 650, quantity: 1 },
              { title: 'Дюна', price: 920, quantity: 1 }
            ]
          }
        ];
        return of({ user, orders });
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
