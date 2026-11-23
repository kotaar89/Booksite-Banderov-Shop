import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { CabinetComponent } from './pages/cabinet/cabinet.component';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'БукРид — Главная' },
  { path: 'catalog', component: CatalogComponent, title: 'Каталог книг — БукРид' },
  { path: 'cart', component: CartComponent, title: 'Корзина — БукРид' },
  { 
    path: 'checkout', 
    component: CheckoutComponent, 
    canActivate: [authGuard], 
    title: 'Оформление заказа — БукРид' 
  },
  { 
    path: 'login', 
    component: LoginComponent, 
    canActivate: [guestGuard], 
    title: 'Вход в аккаунт — БукРид' 
  },
  { 
    path: 'register', 
    component: RegisterComponent, 
    canActivate: [guestGuard], 
    title: 'Регистрация — БукРид' 
  },
  { 
    path: 'cabinet', 
    component: CabinetComponent, 
    canActivate: [authGuard], 
    title: 'Личный кабинет — БукРид' 
  },
  { path: '**', redirectTo: '' }
];
