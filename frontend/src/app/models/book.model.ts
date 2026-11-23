export interface Category {
  id: number;
  name: string;
  slug: string;
  book_count?: number;
}

// Класс модели товара (Книги)
export class Book {
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

  constructor(data: Partial<Book>) {
    this.id = data.id || 0;
    this.category_id = data.category_id || 1;
    this.category_name = data.category_name || '';
    this.category_slug = data.category_slug || '';
    this.title = data.title || '';
    this.author = data.author || '';
    this.description = data.description || '';
    this.price = data.price || 0;
    this.old_price = data.old_price || null;
    this.rating = data.rating || 5.0;
    this.is_popular = data.is_popular ?? false;
    this.is_promo = data.is_promo ?? false;
    this.stock = data.stock ?? 10;
    this.image = data.image || '';
    this.created_at = data.created_at;
  }
}

// Начальные демонстрационные данные категорий
export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Классическая литература', slug: 'classics', book_count: 2 },
  { id: 2, name: 'Фантастика и фэнтези', slug: 'sci-fi-fantasy', book_count: 4 },
  { id: 3, name: 'Бизнес и саморазвитие', slug: 'business', book_count: 3 },
  { id: 4, name: 'Детективы и триллеры', slug: 'detective', book_count: 2 },
  { id: 5, name: 'Современная проза', slug: 'contemporary', book_count: 1 }
];

// Начальные (дефолтные) данные класса товаров прямо в файле с классом
export const INITIAL_BOOKS: Book[] = [
  new Book({
    id: 1,
    category_id: 1,
    category_name: 'Классическая литература',
    category_slug: 'classics',
    title: 'Мастер и Маргарита',
    author: 'Михаил Булгаков',
    description: 'Бессмертный роман о добре и зле, любви и творчестве, визите Воланда в Москву 1930-х годов.',
    price: 650,
    old_price: 850,
    rating: 4.9,
    is_popular: true,
    is_promo: true,
    stock: 15,
    image: 'master-i-margarita.jpg'
  }),
  new Book({
    id: 2,
    category_id: 2,
    category_name: 'Фантастика и фэнтези',
    category_slug: 'sci-fi-fantasy',
    title: 'Дюна',
    author: 'Фрэнк Герберт',
    description: 'Грандиозная космическая эпопея об Арракисе, пустынной планете пряности и гигантских песчаных червей.',
    price: 920,
    old_price: null,
    rating: 4.8,
    is_popular: true,
    is_promo: false,
    stock: 12,
    image: 'dune.jpg'
  }),
  new Book({
    id: 3,
    category_id: 2,
    category_name: 'Фантастика и фэнтези',
    category_slug: 'sci-fi-fantasy',
    title: '1984',
    author: 'Джордж Оруэлл',
    description: 'Культовая антиутопия о тоталитарном обществе, слежке Большого Брата и борьбе за свободу мысли.',
    price: 490,
    old_price: 620,
    rating: 4.7,
    is_popular: true,
    is_promo: true,
    stock: 20,
    image: '1984.jpg'
  }),
  new Book({
    id: 4,
    category_id: 3,
    category_name: 'Бизнес и саморазвитие',
    category_slug: 'business',
    title: 'Атомные привычки',
    author: 'Джеймс Клир',
    description: 'Практическое руководство по формированию полезных привычек и избавлению от вредных микрошагами.',
    price: 890,
    old_price: null,
    rating: 4.9,
    is_popular: true,
    is_promo: false,
    stock: 8,
    image: 'atomic-habits.jpg'
  }),
  new Book({
    id: 5,
    category_id: 4,
    category_name: 'Детективы и триллеры',
    category_slug: 'detective',
    title: 'Убийство в Восточном экспрессе',
    author: 'Агата Кристи',
    description: 'Знаменитое расследование Эркюля Пуаро в застрявшем посреди снежной метели поезде.',
    price: 530,
    old_price: 700,
    rating: 4.6,
    is_popular: true,
    is_promo: true,
    stock: 14,
    image: 'orient-express.jpg'
  }),
  new Book({
    id: 6,
    category_id: 1,
    category_name: 'Классическая литература',
    category_slug: 'classics',
    title: 'Преступление и наказание',
    author: 'Федор Достоевский',
    description: 'Глубокая психологическая драма Родиона Раскольникова о границах дозволенного и муках совести.',
    price: 580,
    old_price: null,
    rating: 4.8,
    is_popular: false,
    is_promo: false,
    stock: 18,
    image: 'prestuplenie-i-nakazanie.jpg'
  }),
  new Book({
    id: 7,
    category_id: 2,
    category_name: 'Фантастика и фэнтези',
    category_slug: 'sci-fi-fantasy',
    title: 'Гарри Поттер и философский камень',
    author: 'Дж. К. Роулинг',
    description: 'Начало легендарной истории о мальчике-волшебнике и тайнах школы магии Хогвартс.',
    price: 950,
    old_price: 1200,
    rating: 5.0,
    is_popular: true,
    is_promo: true,
    stock: 25,
    image: 'harry-potter-1.jpg'
  }),
  new Book({
    id: 8,
    category_id: 3,
    category_name: 'Бизнес и саморазвитие',
    category_slug: 'business',
    title: 'Думай медленно... решай быстро',
    author: 'Даниэль Канеман',
    description: 'Книга нобелевского лауреата об особенностях человеческого мышления, ошибках и принятии решений.',
    price: 1100,
    old_price: null,
    rating: 4.7,
    is_popular: false,
    is_promo: false,
    stock: 7,
    image: 'thinking-fast-and-slow.jpg'
  }),
  new Book({
    id: 9,
    category_id: 4,
    category_name: 'Детективы и триллеры',
    category_slug: 'detective',
    title: 'Шерлок Холмс: Этюд в багровых тонах',
    author: 'Артур Конан Дойл',
    description: 'Первое дело гениального сыщика с Бейкер-стрит и его верного спутника доктора Ватсона.',
    price: 450,
    old_price: 590,
    rating: 4.8,
    is_popular: true,
    is_promo: true,
    stock: 16,
    image: 'sherlock-holmes.jpg'
  }),
  new Book({
    id: 10,
    category_id: 5,
    category_name: 'Современная проза',
    category_slug: 'contemporary',
    title: 'Цветы для Элджернона',
    author: 'Дэниел Киз',
    description: 'Трогательная история умственно отсталого Чарли Гордона, над которым проводят смелый эксперимент.',
    price: 620,
    old_price: null,
    rating: 4.9,
    is_popular: true,
    is_promo: false,
    stock: 11,
    image: 'flowers-for-algernon.jpg'
  }),
  new Book({
    id: 11,
    category_id: 2,
    category_name: 'Фантастика и фэнтези',
    category_slug: 'sci-fi-fantasy',
    title: 'Ведьмак: Последнее желание',
    author: 'Анджей Сапковский',
    description: 'Первая книга захватывающей саги о Геральте из Ривии, профессиональном охотнике на чудовищ.',
    price: 840,
    old_price: 990,
    rating: 4.8,
    is_popular: false,
    is_promo: true,
    stock: 9,
    image: 'witcher-1.jpg'
  }),
  new Book({
    id: 12,
    category_id: 3,
    category_name: 'Бизнес и саморазвитие',
    category_slug: 'business',
    title: 'Богатый папа, бедный папа',
    author: 'Роберт Кийосаки',
    description: 'Основы финансовой грамотности, меняющие взгляд на работу по найму, инвестиции и активы.',
    price: 740,
    old_price: null,
    rating: 4.5,
    is_popular: false,
    is_promo: false,
    stock: 13,
    image: 'rich-dad-poor-dad.jpg'
  })
];

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
