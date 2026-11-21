import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, timeout } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Book, Category } from '../models/book.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private http = inject(HttpClient);
  private apiUrl = API_CONFIG.baseUrl;

  // Резервные демонстрационные данные (работают всегда, даже если сервер временно не отвечает)
  private mockCategories: Category[] = [
    { id: 1, name: 'Классическая литература', slug: 'classics', book_count: 2 },
    { id: 2, name: 'Фантастика и фэнтези', slug: 'sci-fi-fantasy', book_count: 4 },
    { id: 3, name: 'Бизнес и саморазвитие', slug: 'business', book_count: 3 },
    { id: 4, name: 'Детективы и триллеры', slug: 'detective', book_count: 2 },
    { id: 5, name: 'Современная проза', slug: 'contemporary', book_count: 1 }
  ];

  private mockBooks: Book[] = [
    {
      id: 1,
      category_id: 1,
      category_name: 'Классическая литература',
      category_slug: 'classics',
      title: 'Мастер и Маргарита',
      author: 'Михаил Булгаков',
      description: 'Бессмертный роман о добре и зле, любви и творчестве, визите Воланда в Москву 1930-х годов.',
      price: 650,
      old_price: 850,
      rating: 4.9,
      is_popular: true,
      is_promo: true,
      stock: 15,
      image: 'master-i-margarita.jpg'
    },
    {
      id: 2,
      category_id: 2,
      category_name: 'Фантастика и фэнтези',
      category_slug: 'sci-fi-fantasy',
      title: 'Дюна',
      author: 'Фрэнк Герберт',
      description: 'Грандиозная космическая эпопея об Арракисе, пустынной планете пряности и гигантских песчаных червей.',
      price: 920,
      old_price: null,
      rating: 4.8,
      is_popular: true,
      is_promo: false,
      stock: 12,
      image: 'dune.jpg'
    },
    {
      id: 3,
      category_id: 2,
      category_name: 'Фантастика и фэнтези',
      category_slug: 'sci-fi-fantasy',
      title: '1984',
      author: 'Джордж Оруэлл',
      description: 'Культовая антиутопия о тоталитарном обществе, слежке Большого Брата и борьбе за свободу мысли.',
      price: 490,
      old_price: 620,
      rating: 4.7,
      is_popular: true,
      is_promo: true,
      stock: 20,
      image: '1984.jpg'
    },
    {
      id: 4,
      category_id: 3,
      category_name: 'Бизнес и саморазвитие',
      category_slug: 'business',
      title: 'Атомные привычки',
      author: 'Джеймс Клир',
      description: 'Практическое руководство по формированию полезных привычек и избавлению от вредных микрошагами.',
      price: 890,
      old_price: null,
      rating: 4.9,
      is_popular: true,
      is_promo: false,
      stock: 8,
      image: 'atomic-habits.jpg'
    },
    {
      id: 5,
      category_id: 4,
      category_name: 'Детективы и триллеры',
      category_slug: 'detective',
      title: 'Убийство в Восточном экспрессе',
      author: 'Агата Кристи',
      description: 'Знаменитое расследование Эркюля Пуаро в застрявшем посреди снежной метели поезде.',
      price: 530,
      old_price: 700,
      rating: 4.6,
      is_popular: true,
      is_promo: true,
      stock: 14,
      image: 'orient-express.jpg'
    },
    {
      id: 6,
      category_id: 1,
      category_name: 'Классическая литература',
      category_slug: 'classics',
      title: 'Преступление и наказание',
      author: 'Федор Достоевский',
      description: 'Глубокая психологическая драма Родиона Раскольникова о границах дозволенного и муках совести.',
      price: 580,
      old_price: null,
      rating: 4.8,
      is_popular: false,
      is_promo: false,
      stock: 18,
      image: 'prestuplenie-i-nakazanie.jpg'
    },
    {
      id: 7,
      category_id: 2,
      category_name: 'Фантастика и фэнтези',
      category_slug: 'sci-fi-fantasy',
      title: 'Гарри Поттер и философский камень',
      author: 'Дж. К. Роулинг',
      description: 'Начало легендарной истории о мальчике-волшебнике и тайнах школы магии Хогвартс.',
      price: 950,
      old_price: 1200,
      rating: 5.0,
      is_popular: true,
      is_promo: true,
      stock: 25,
      image: 'harry-potter-1.jpg'
    },
    {
      id: 8,
      category_id: 3,
      category_name: 'Бизнес и саморазвитие',
      category_slug: 'business',
      title: 'Думай медленно... решай быстро',
      author: 'Даниэль Канеман',
      description: 'Книга нобелевского лауреата об особенностях человеческого мышления, ошибках и принятии решений.',
      price: 1100,
      old_price: null,
      rating: 4.7,
      is_popular: false,
      is_promo: false,
      stock: 7,
      image: 'thinking-fast-and-slow.jpg'
    },
    {
      id: 9,
      category_id: 4,
      category_name: 'Детективы и триллеры',
      category_slug: 'detective',
      title: 'Шерлок Холмс: Этюд в багровых тонах',
      author: 'Артур Конан Дойл',
      description: 'Первое дело гениального сыщика с Бейкер-стрит и его верного спутника доктора Ватсона.',
      price: 450,
      old_price: 590,
      rating: 4.8,
      is_popular: true,
      is_promo: true,
      stock: 16,
      image: 'sherlock-holmes.jpg'
    },
    {
      id: 10,
      category_id: 5,
      category_name: 'Современная проза',
      category_slug: 'contemporary',
      title: 'Цветы для Элджернона',
      author: 'Дэниел Киз',
      description: 'Трогательная история умственно отсталого Чарли Гордона, над которым проводят смелый эксперимент.',
      price: 620,
      old_price: null,
      rating: 4.9,
      is_popular: true,
      is_promo: false,
      stock: 11,
      image: 'flowers-for-algernon.jpg'
    },
    {
      id: 11,
      category_id: 2,
      category_name: 'Фантастика и фэнтези',
      category_slug: 'sci-fi-fantasy',
      title: 'Ведьмак: Последнее желание',
      author: 'Анджей Сапковский',
      description: 'Первая книга захватывающей саги о Геральте из Ривии, профессиональном охотнике на чудовищ.',
      price: 840,
      old_price: 990,
      rating: 4.8,
      is_popular: false,
      is_promo: true,
      stock: 9,
      image: 'witcher-1.jpg'
    },
    {
      id: 12,
      category_id: 3,
      category_name: 'Бизнес и саморазвитие',
      category_slug: 'business',
      title: 'Богатый папа, бедный папа',
      author: 'Роберт Кийосаки',
      description: 'Основы финансовой грамотности, меняющие взгляд на работу по найму, инвестиции и активы.',
      price: 740,
      old_price: null,
      rating: 4.5,
      is_popular: false,
      is_promo: false,
      stock: 13,
      image: 'rich-dad-poor-dad.jpg'
    }
  ];

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
