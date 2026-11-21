import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { CartService } from '../../services/cart.service';
import { Book, Category } from '../../models/book.model';
import { BookCardComponent } from '../../components/book-card/book-card.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, BookCardComponent],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  private bookService = inject(BookService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  books: Book[] = [];
  categories: Category[] = [];
  selectedCategory = 'all';
  searchQuery = '';
  onlyPromo = false;
  sortBy = 'default';
  loading = false;
  selectedBook: Book | null = null;

  ngOnInit(): void {
    this.loadCategories();

    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      if (params['promo']) {
        this.onlyPromo = params['promo'] === '1' || params['promo'] === 'true';
      }
      if (params['search']) {
        this.searchQuery = params['search'];
      }
      this.loadBooks();
    });
  }

  loadCategories(): void {
    this.bookService.getCategories().subscribe({
      next: (cats) => {
        this.categories = Array.isArray(cats) ? cats : [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.categories = [];
        this.cdr.markForCheck();
      }
    });
  }

  loadBooks(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.bookService.getBooks({
      category_slug: this.selectedCategory !== 'all' ? this.selectedCategory : undefined,
      search: this.searchQuery.trim() || undefined,
      promo: this.onlyPromo ? true : undefined
    }).subscribe({
      next: (books) => {
        this.books = this.sortBooksList(Array.isArray(books) ? books : []);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Ошибка загрузки книг:', err);
        this.books = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onCategorySelect(slug: string): void {
    this.selectedCategory = slug;
    this.updateUrl();
  }

  onSearch(): void {
    this.updateUrl();
  }

  onPromoToggle(): void {
    this.onlyPromo = !this.onlyPromo;
    this.updateUrl();
  }

  onSortChange(): void {
    this.books = this.sortBooksList([...this.books]);
    this.cdr.markForCheck();
  }

  resetFilters(): void {
    this.selectedCategory = 'all';
    this.searchQuery = '';
    this.onlyPromo = false;
    this.sortBy = 'default';
    this.router.navigate(['/catalog']);
  }

  private updateUrl(): void {
    const queryParams: any = {};
    if (this.selectedCategory !== 'all') queryParams.category = this.selectedCategory;
    if (this.onlyPromo) queryParams.promo = '1';
    if (this.searchQuery.trim()) queryParams.search = this.searchQuery.trim();

    this.router.navigate(['/catalog'], { queryParams });
  }

  private sortBooksList(list: Book[]): Book[] {
    if (!Array.isArray(list)) return [];
    switch (this.sortBy) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...list].sort((a, b) => b.rating - a.rating);
      default:
        return list;
    }
  }

  openDetails(book: Book): void {
    this.selectedBook = book;
    this.cdr.markForCheck();
  }

  closeDetails(): void {
    this.selectedBook = null;
    this.cdr.markForCheck();
  }

  addToCartFromModal(book: Book): void {
    this.cartService.addToCart(book);
    this.closeDetails();
  }
}
