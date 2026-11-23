import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard для защиты приватных страниц (Личный кабинет, Оформление заказа).
 * Если пользователь не авторизован, перенаправляет на страницу входа (/login).
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Перенаправляем на страницу авторизации с сохранением обратного URL
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Guard для гостевых страниц (Вход, Регистрация).
 * Если пользователь уже авторизован, не пускает его на страницу логина/регистрации,
 * а перенаправляет в Личный кабинет (/cabinet).
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  // Уже в системе — отправляем в личный кабинет
  router.navigate(['/cabinet']);
  return false;
};
