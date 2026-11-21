import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  public cartService = inject(CartService);
  public authService = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  // Поля формы
  customerName = '';
  customerEmail = '';
  customerPhone = '';
  deliveryAddress = '';
  paymentMethod = 'card_online';
  comments = '';

  isSubmitting = false;
  orderSuccess = false;
  createdOrderId: number | null = null;
  errorMessage: string | null = null;

  ngOnInit(): void {
    // Автозаполнение из профиля авторизованного пользователя
    const user = this.authService.currentUser();
    if (user) {
      this.customerName = user.name || '';
      this.customerEmail = user.email || '';
      this.customerPhone = user.phone || '';
      this.deliveryAddress = user.address || '';
    }
  }

  get deliveryCost(): number {
    return this.cartService.totalPrice() >= 2000 ? 0 : 250;
  }

  get finalTotal(): number {
    return this.cartService.totalPrice() + this.deliveryCost;
  }

  onSubmit(): void {
    if (!this.customerName.trim() || !this.customerPhone.trim() || !this.deliveryAddress.trim()) {
      this.errorMessage = 'Пожалуйста, заполните имя, номер телефона и адрес доставки.';
      return;
    }

    if (this.cartService.items().length === 0) {
      this.errorMessage = 'Ваша корзина пуста.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const paymentMap: Record<string, string> = {
      'card_online': 'Банковской картой онлайн',
      'sbp': 'СБП (Система быстрых платежей)',
      'upon_receipt': 'При получении (наличные или карта)'
    };

    const orderPayload = {
      user_id: this.authService.currentUser()?.id || null,
      customer_name: this.customerName.trim(),
      customer_email: this.customerEmail.trim(),
      customer_phone: this.customerPhone.trim(),
      delivery_address: this.deliveryAddress.trim(),
      payment_method: paymentMap[this.paymentMethod] || 'При получении',
      comments: this.comments.trim(),
      items: this.cartService.items().map(i => ({
        id: i.book.id,
        book_id: i.book.id,
        title: i.book.title,
        price: i.book.price,
        quantity: i.quantity
      }))
    };

    this.orderService.createOrder(orderPayload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.orderSuccess = true;
          this.createdOrderId = res.order_id || 1001;
          this.cartService.clearCart();
        } else {
          this.errorMessage = res.error || 'Не удалось сохранить заказ.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'Произошла ошибка при отправке заказа.';
      }
    });
  }
}
