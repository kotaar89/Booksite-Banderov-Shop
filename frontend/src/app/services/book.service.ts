import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, timeout } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Book, Category, INITIAL_BOOKS, INITIAL_CATEGORIES } from '../models/book.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private http = inject(HttpClient);
  private apiUrl = API_CONFIG.baseUrl;

  // Начальные данные импортируются напрямую из файла класса модели (src/app/models/book.model.ts)
  private mockCategories: Category[] = INITIAL_CATEGORIES;
  private mockBooks: Book[] = INITIAL_BOOKS;

  getCategories(): Observable<Category[]> {
    return this.http.get<{ success: boolean; data: Category[] }>(`${this.apiUrl}/categories.php`).pipe(
      timeout(2000),
      map(res => (res && Array.isArray(res.data)) ? res.data : this.mockCategories),
      catchError(err => {
        console.warn('Backend categories.php недоступен, используем резервные категории', err);
        return of(this.mockCategories);
      })
    );
  }

  getBooks(filters?: {
    category_slug?: string;
    search?: string;
    promo?: boolean;
    popular?: boolean;
    random?: boolean;
    limit?: number;
  }): Observable<Book[]> {
    let params = new HttpParams();
    if (filters?.category_slug && filters.category_slug !== 'all') {
      params = params.set('category_slug', filters.category_slug);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.promo) {
      params = params.set('promo', '1');
    }
    if (filters?.popular) {
      params = params.set('popular', '1');
    }
    if (filters?.random) {
      params = params.set('random', '1');
    }
    if (filters?.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<{ success: boolean; data: Book[] }>(`${this.apiUrl}/books.php`, { params }).pipe(
      timeout(2000),
      map(res => {
        if (res && Array.isArray(res.data)) {
          return res.data;
        }
        return this.filterMockBooks(filters);
      }),
      catchError(err => {
        console.warn('Backend books.php недоступен или вернул ошибку, отображаем резервный каталог:', err);
        return of(this.filterMockBooks(filters));
      })
    );
  }

  private filterMockBooks(filters?: {
    category_slug?: string;
    search?: string;
    promo?: boolean;
    popular?: boolean;
    random?: boolean;
    limit?: number;
  }): Book[] {
    let result = [...this.mockBooks];

    if (filters?.category_slug && filters.category_slug !== 'all') {
      result = result.filter(b => b.category_slug === filters.category_slug);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(s) || 
        b.author.toLowerCase().includes(s) ||
        b.description.toLowerCase().includes(s)
      );
    }
    if (filters?.promo) {
      result = result.filter(b => b.is_promo);
    }
    if (filters?.popular) {
      result = result.filter(b => b.is_popular);
    }
    if (filters?.random) {
      result.sort(() => Math.random() - 0.5);
    }
    if (filters?.limit) {
      result = result.slice(0, filters.limit);
    }
    return result;
  }

  getBookById(id: number): Observable<Book | null> {
    return this.http.get<{ success: boolean; data: Book }>(`${this.apiUrl}/books.php?id=${id}`).pipe(
      timeout(2000),
      map(res => (res && res.data) ? res.data : (this.mockBooks.find(b => b.id === id) || null)),
      catchError(err => {
        console.warn(`Backend books.php?id=${id} недоступен`, err);
        const found = this.mockBooks.find(b => b.id === id) || null;
        return of(found);
      })
    );
  }
}
