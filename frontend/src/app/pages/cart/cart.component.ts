import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  public cartService = inject(CartService);

  get deliveryCost(): number {
    if (this.cartService.totalPrice() >= 2000 || this.cartService.totalPrice() === 0) {
      return 0;
    }
    return 250;
  }

  get finalTotal(): number {
    if (this.cartService.totalPrice() === 0) return 0;
    return this.cartService.totalPrice() + this.deliveryCost;
  }

  increase(book: Book, currentQty: number): void {
    this.cartService.updateQuantity(book.id, currentQty + 1);
  }

  decrease(book: Book, currentQty: number): void {
    if (currentQty > 1) {
      this.cartService.updateQuantity(book.id, currentQty - 1);
    } else {
      this.removeItem(book.id);
    }
  }

  removeItem(bookId: number): void {
    this.cartService.removeFromCart(bookId);
  }

  clearCart(): void {
    if (confirm('Очистить корзину?')) {
      this.cartService.clearCart();
    }
  }
}
