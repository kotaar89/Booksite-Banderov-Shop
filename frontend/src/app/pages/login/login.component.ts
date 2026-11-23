import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = 'test@example.com';
  password = '';
  errorMessage: string | null = null;
  isLoading = false;

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Пожалуйста, введите email и пароль';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          // Если Guard перенаправил на логин (например, с /checkout), возвращаем пользователя туда
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/cabinet';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.errorMessage = res.error || 'Ошибка входа';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = typeof err === 'string' ? err : 'Неверный логин или пароль';
      }
    });
  }

  fillDemo(): void {
    this.email = 'test@example.com';
    this.password = '123456';
  }
}
