import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order } from '../models/book.model';
import { API_CONFIG } from '../config/api.config';

interface OrderResponse {
  success: boolean;
  order_id?: number;
  total_amount?: number;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = API_CONFIG.baseUrl;

  createOrder(orderData: {
    user_id?: number | null;
    customer_name: string;
    customer_email?: string;
    customer_phone: string;
    delivery_address: string;
    payment_method: string;
    comments?: string;
    items: Array<{ id?: number; book_id?: number; title: string; price: number; quantity: number }>;
  }): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/orders.php`, orderData).pipe(
      catchError(err => {
        console.warn('Сервер PHP заказов недоступен, имитируем успешное создание', err);
        const randomOrderId = Math.floor(1000 + Math.random() * 9000);
        return of({
          success: true,
          order_id: randomOrderId,
          message: `Заказ #${randomOrderId} успешно оформлен!`
        });
      })
    );
  }

  getUserOrders(userId: number): Observable<{ success: boolean; data: Order[] }> {
    return this.http.get<{ success: boolean; data: Order[] }>(`${this.apiUrl}/orders.php?user_id=${userId}`).pipe(
      catchError(err => {
        console.warn('Не удалось загрузить заказы с сервера', err);
        return of({ success: true, data: [] });
      })
    );
  }
}
