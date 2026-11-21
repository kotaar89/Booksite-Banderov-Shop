import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { User, Order } from '../../models/book.model';

@Component({
  selector: 'app-cabinet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cabinet.component.html',
  styleUrls: ['./cabinet.component.css']
})
export class CabinetComponent implements OnInit {
  public authService = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  user: User | null = null;
  orders: Order[] = [];
  isLoading = false;
  isSaving = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Редактируемые поля
  editName = '';
  editPhone = '';
  editAddress = '';

  activeTab: 'orders' | 'profile' = 'orders';

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = this.authService.currentUser();
    if (this.user) {
      this.initForm(this.user);
      this.loadUserOrders(this.user.id);
    }
  }

  initForm(user: User): void {
    this.editName = user.name || '';
    this.editPhone = user.phone || '';
    this.editAddress = user.address || '';
  }

  loadUserOrders(userId: number): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.authService.getProfile(userId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.user) {
          this.user = res.user;
          this.initForm(res.user);
        }
        this.orders = res.orders || [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  saveProfile(): void {
    if (!this.user) return;

    this.isSaving = true;
    this.successMessage = null;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.authService.updateProfile({
      id: this.user.id,
      name: this.editName.trim(),
      phone: this.editPhone.trim(),
      address: this.editAddress.trim()
    }).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.successMessage = 'Данные профиля успешно обновлены!';
        this.user = this.authService.currentUser();
        this.cdr.markForCheck();
        setTimeout(() => {
          this.successMessage = null;
          this.cdr.markForCheck();
        }, 3000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = 'Не удалось сохранить данные.';
        this.cdr.markForCheck();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  get totalOrders(): number {
    return this.orders.length;
  }

  get totalSpent(): number {
    return this.orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  }
}
