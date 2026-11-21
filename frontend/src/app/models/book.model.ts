export interface Category {
  id: number;
  name: string;
  slug: string;
  book_count?: number;
}

export interface Book {
  id: number;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  title: string;
  author: string;
  description: string;
  price: number;
  old_price?: number | null;
  rating: number;
  is_popular: number | boolean;
  is_promo: number | boolean;
  stock: number;
  image: string;
  created_at?: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  created_at?: string;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  book_id?: number;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id?: number;
  user_id?: number | null;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  delivery_address: string;
  payment_method: string;
  comments?: string | null;
  total_amount: number;
  status?: string;
  created_at?: string;
  items?: OrderItem[];
}
