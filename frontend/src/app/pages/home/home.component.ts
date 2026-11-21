import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookService } from '../../services/book.service';
import { CartService } from '../../services/cart.service';
import { Book, Category } from '../../models/book.model';
import { BookCardComponent } from '../../components/book-card/book-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, BookCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private bookService = inject(BookService);
  private cartService = inject(CartService);
  private cdr = inject(ChangeDetectorRef);

  promoBooks: Book[] = [];
  popularBooks: Book[] = [];
  categories: Category[] = [];
  selectedBook: Book | null = null;
  loading = true;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    // Загрузка категорий
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

    // Загрузка книг по акции (скидки)
    this.bookService.getBooks({ promo: true, limit: 4 }).subscribe({
      next: (books) => {
        this.promoBooks = Array.isArray(books) ? books : [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.promoBooks = [];
        this.cdr.markForCheck();
      }
    });

    // Загрузка популярных / случайных книг
    this.bookService.getBooks({ popular: true, random: true, limit: 8 }).subscribe({
      next: (books) => {
        this.popularBooks = Array.isArray(books) ? books : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.popularBooks = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
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
