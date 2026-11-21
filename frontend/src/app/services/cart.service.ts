import { Injectable, signal, computed } from '@angular/core';
import { Book, CartItem } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSignal = signal<CartItem[]>(this.loadCartFromStorage());
  public items = this.cartItemsSignal.asReadonly();

  // Общее количество книг в корзине
  public totalCount = computed(() => {
    return this.cartItemsSignal().reduce((sum, item) => sum + item.quantity, 0);
  });

  // Общая стоимость
  public totalPrice = computed(() => {
    return this.cartItemsSignal().reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
  });

  // Всплывающее уведомление о добавлении товара
  public lastAddedMessage = signal<string | null>(null);

  private loadCartFromStorage(): CartItem[] {
    try {
      const saved = localStorage.getItem('bookstore_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(items: CartItem[]): void {
    localStorage.setItem('bookstore_cart', JSON.stringify(items));
    this.cartItemsSignal.set(items);
  }

  addToCart(book: Book, quantity: number = 1): void {
    const current = [...this.cartItemsSignal()];
    const index = current.findIndex(item => item.book.id === book.id);

    if (index > -1) {
      current[index] = {
        ...current[index],
        quantity: current[index].quantity + quantity
      };
    } else {
      current.push({ book, quantity });
    }

    this.saveToStorage(current);
    this.showToast(`«${book.title}» добавлена в корзину!`);
  }

  removeFromCart(bookId: number): void {
    const current = this.cartItemsSignal().filter(item => item.book.id !== bookId);
    this.saveToStorage(current);
  }

  updateQuantity(bookId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(bookId);
      return;
    }

    const current = this.cartItemsSignal().map(item => {
      if (item.book.id === bookId) {
        return { ...item, quantity };
      }
      return item;
    });

    this.saveToStorage(current);
  }

  clearCart(): void {
    this.saveToStorage([]);
  }

  private showToast(message: string): void {
    this.lastAddedMessage.set(message);
    setTimeout(() => {
      if (this.lastAddedMessage() === message) {
        this.lastAddedMessage.set(null);
      }
    }, 2800);
  }
}
