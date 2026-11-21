import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../../models/book.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.css']
})
export class BookCardComponent {
  @Input({ required: true }) book!: Book;
  @Output() viewDetails = new EventEmitter<Book>();

  private cartService = inject(CartService);
  imageFailed = false;

  get discountPercent(): number | null {
    if (this.book.old_price && this.book.old_price > this.book.price) {
      return Math.round(((this.book.old_price - this.book.price) / this.book.old_price) * 100);
    }
    return null;
  }

  // Детерминированная цветовая тема для стилизованной обложки
  get themeClass(): string {
    const id = this.book.id || 1;
    const themes = ['theme-1', 'theme-2', 'theme-3', 'theme-4'];
    return themes[id % themes.length];
  }

  onImageError(): void {
    this.imageFailed = true;
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(this.book);
  }

  onCardClick(): void {
    this.viewDetails.emit(this.book);
  }
}
