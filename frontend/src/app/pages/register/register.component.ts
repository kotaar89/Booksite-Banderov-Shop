import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  phone = '';
  address = '';

  errorMessage: string | null = null;
  isLoading = false;

  onRegister(): void {
    if (!this.name.trim() || !this.email.trim() || !this.password) {
      this.errorMessage = 'Заполните обязательные поля: имя, email и пароль';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Пароль должен быть не менее 6 символов';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Пароли не совпадают';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.authService.register({
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password,
      phone: this.phone.trim(),
      address: this.address.trim()
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/cabinet';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.errorMessage = res.error || 'Ошибка регистрации';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = typeof err === 'string' ? err : 'Ошибка при регистрации';
      }
    });
  }
}
