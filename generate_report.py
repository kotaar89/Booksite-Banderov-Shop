import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

doc = docx.Document()

# Установка полей документа (2 см со всех сторон)
sections = doc.sections
for section in sections:
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(0.8)

# Цветовая палитра
COLOR_PRIMARY = RGBColor(67, 56, 202)    # Indigo
COLOR_DARK = RGBColor(15, 23, 42)        # Slate 900
COLOR_MUTED = RGBColor(100, 116, 139)    # Slate 500

def set_cell_shading(cell, color_hex):
    shading_xml = f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>'
    cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

def add_header(text, level=1):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.bold = True
    if level == 1:
        run.font.size = Pt(16)
        run.font.color.rgb = COLOR_PRIMARY
    elif level == 2:
        run.font.size = Pt(13)
        run.font.color.rgb = COLOR_DARK
    else:
        run.font.size = Pt(11)
        run.font.color.rgb = COLOR_DARK
    return p

def add_body_p(text, bold_prefix="", italic_prefix=""):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_b = p.add_run(bold_prefix)
        r_b.font.name = 'Calibri'
        r_b.font.size = Pt(11)
        r_b.bold = True
    if italic_prefix:
        r_i = p.add_run(italic_prefix)
        r_i.font.name = 'Calibri'
        r_i.font.size = Pt(11)
        r_i.italic = True
    r = p.add_run(text)
    r.font.name = 'Calibri'
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_DARK
    return p

def add_code_block(code_text):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(6.5)
    
    cell = tbl.cell(0, 0)
    set_cell_shading(cell, "F1F5F9")
    cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    
    # рамка
    tcPr = cell._tc.get_or_add_tcPr()
    borders_xml = f'''<w:tcBorders {nsdecls("w")}>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        <w:left w:val="single" w:sz="18" w:space="0" w:color="4338CA"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
    </w:tcBorders>'''
    tcPr.append(parse_xml(borders_xml))
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.05
    run = p.add_run(code_text.strip())
    run.font.name = 'Consolas'
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(30, 41, 59)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

# ----------------- ТИТУЛЬНЫЙ ЛИСТ -----------------
p_top = doc.add_paragraph()
p_top.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_top.paragraph_format.space_after = Pt(30)
r_inst = p_top.add_run("ОТЧЕТ ПО ЛАБОРАТОРНОЙ / ПРАКТИЧЕСКОЙ РАБОТЕ\nпо дисциплине «Веб-разработка и клиент-серверные технологии»")
r_inst.font.name = 'Arial'
r_inst.font.size = Pt(11)
r_inst.font.color.rgb = COLOR_MUTED

p_title = doc.add_paragraph()
p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_title.paragraph_format.space_after = Pt(12)
r_title = p_title.add_run("ТЕМА: «Разработка архитектуры интернет-магазина книг на стеке Angular 19 (Frontend) и PHP REST API (Backend) с СУБД MySQL MAMP, защитой маршрутов (Guards) и классами моделей данных»")
r_title.font.name = 'Arial'
r_title.font.size = Pt(16)
r_title.bold = True
r_title.font.color.rgb = COLOR_PRIMARY

p_sub = doc.add_paragraph()
p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_sub.paragraph_format.space_after = Pt(40)
r_sub = p_sub.add_run("Проект: Интернет-магазин «БукРид» (BookRead)")
r_sub.font.name = 'Arial'
r_sub.font.size = Pt(12)
r_sub.italic = True

p_author = doc.add_paragraph()
p_author.alignment = WD_ALIGN_PARAGRAPH.RIGHT
p_author.paragraph_format.space_after = Pt(60)
r_auth = p_author.add_run("Выполнил(а): студент(ка)\nПроверил: преподаватель\nДата: Ноябрь 2026 г.")
r_auth.font.name = 'Calibri'
r_auth.font.size = Pt(11)

doc.add_page_break()

# ----------------- 1. ВВЕДЕНИЕ И ПОСТАНОВКА ЗАДАЧИ -----------------
add_header("1. Введение и цели работы", level=1)
add_body_p(
    "Целью настоящей работы является разработка масштабируемого веб-приложения интернет-магазина книг с четким архитектурным разделением ответственности (Separation of Concerns). "
    "В соответствии с техническим заданием, клиентская часть (Frontend) полностью переведена на современный компонентный фреймворк Angular, "
    "а серверная часть (Backend) реализована на языке PHP в формате легковесного REST API, выполняющего роль связующего звена с базой данных MySQL и парсера передаваемых данных."
)

add_body_p("В процессе выполнения работы решены следующие ключевые задачи:", bold_prefix="Задачи исследования: ")
tasks = [
    "Проектирование и развертывание реляционной базы данных bookstore_db в СУБД MySQL под управлением среды MAMP.",
    "Создание PHP REST API эндпоинтов для выборки и фильтрации товаров, работы с категориями, аутентификации пользователей и оформления заказов.",
    "Разработка клиентского Single Page Application (SPA) на Angular 19 с использованием Standalone Components, Signals, Router и Reactive/Template-driven Forms.",
    "Реализация витрины товаров, каталога с живым поиском и сортировкой, корзины покупок с сохранением в localStorage и модуля оформления заказа.",
    "Внедрение механизмов безопасности маршрутизации Angular Guards (CanActivateFn) для разграничения доступа к страницам.",
    "Объектно-ориентированное моделирование: создание класса Book с инкапсуляцией начальных (демонстрационных) данных непосредственно в файле модели."
]
for t in tasks:
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(t)
    run.font.name = 'Calibri'
    run.font.size = Pt(11)

# ----------------- 2. АРХИТЕКТУРА И СТЕК ТЕХНОЛОГИЙ -----------------
add_header("2. Архитектура веб-приложения и стек технологий", level=1)
add_body_p(
    "Архитектура проекта построена по классическому клиент-серверному принципу (Client-Server Architecture). "
    "Клиентская и серверная части полностью изолированы друг от друга и общаются посредством асинхронных HTTP-запросов с форматом обмена данными JSON."
)

# Таблица стека технологий
table_stack = doc.add_table(rows=1, cols=3)
table_stack.alignment = WD_TABLE_ALIGNMENT.CENTER
table_stack.autofit = False
table_stack.columns[0].width = Inches(1.8)
table_stack.columns[1].width = Inches(2.2)
table_stack.columns[2].width = Inches(2.5)

hdr_cells = table_stack.rows[0].cells
hdr_cells[0].text = "Уровень архитектуры"
hdr_cells[1].text = "Технологический стек"
hdr_cells[2].text = "Назначение в проекте"
for c in hdr_cells:
    set_cell_shading(c, "4338CA")
    p = c.paragraphs[0]
    for r in p.runs:
        r.font.name = 'Arial'
        r.font.size = Pt(10)
        r.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

stack_data = [
    ("Клиент (Frontend)", "Angular 19, TypeScript, RxJS, HTML5/CSS3", "Пользовательский интерфейс (SPA), маршрутизация, управление состоянием, Guards, адаптивный дизайн."),
    ("Сервер (Backend)", "PHP 8.x, PDO, Apache (MAMP)", "REST API эндпоинты, валидация входных данных, хэширование паролей (BCRYPT), формирование JSON ответов, CORS."),
    ("База данных (Database)", "MySQL 5.7 / 8.0, phpMyAdmin", "Хранение каталога книг, категорий, учетных записей пользователей, заказов и позиций заказов."),
    ("Контроль версий", "Git, GitHub", "Версионирование исходного кода, командная разработка и резервное копирование.")
]

for row in stack_data:
    row_cells = table_stack.add_row().cells
    for i in range(3):
        row_cells[i].text = row[i]
        p = row_cells[i].paragraphs[0]
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(3)
        for r in p.runs:
            r.font.name = 'Calibri'
            r.font.size = Pt(10)

doc.add_paragraph().paragraph_format.space_after = Pt(6)

# ----------------- 3. АНГЕЛЯР ГВАРДЫ (GUARDS) -----------------
add_header("3. Защита маршрутов: Angular Guards (Гварды)", level=1)
add_body_p(
    "В соответствии с техническим заданием, в проекте реализованы функциональные гварды (Guards) стандарта CanActivateFn. "
    "Гварды в Angular служат для проверки условий перехода пользователя на определенные маршруты до момента активации соответствующего компонента."
)

add_header("3.1. Назначение и логика работы гвардов", level=2)
add_body_p(
    "В приложении созданы два ключевых гварда:", bold_prefix="1. authGuard (Защита авторизованной зоны): "
)
add_body_p(
    "Контролирует доступ к страницам «Личный кабинет» (/cabinet) и «Оформление заказа» (/checkout). "
    "Если пользователь не авторизован (токен или сессия отсутствуют), гварды прерывают навигацию и перенаправляют на страницу /login, "
    "сохраняя целевой URL в query-параметрах для последующего автоматического возврата."
)

add_body_p(
    "Контролирует доступ к страницам «Вход» (/login) и «Регистрация» (/register). "
    "Если пользователь уже успешно вошел в систему, повторный доступ к страницам входа и регистрации бессмысленен — "
    "гвард автоматически перенаправляет пользователя в его личный кабинет (/cabinet).", bold_prefix="2. guestGuard (Защита гостевой зоны): "
)

add_header("3.2. Исходный код файла src/app/guards/auth.guard.ts", level=2)
code_guard = '''import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// 1. Защита приватных страниц (Кабинет, Заказ)
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // Доступ разрешен
  }

  // Редирект неавторизованного пользователя
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

// 2. Защита гостевых страниц (Вход, Регистрация)
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true; // Гостю вход открыт
  }

  // Уже авторизован — отправляем в кабинет
  router.navigate(['/cabinet']);
  return false;
};'''
add_code_block(code_guard)

add_header("3.3. Применение Guards в конфигурации маршрутов (app.routes.ts)", level=2)
add_body_p(
    "Гварды подключаются к маршрутам через свойство canActivate массива Routes:"
)
code_routes = '''export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'БукРид — Главная' },
  { path: 'catalog', component: CatalogComponent, title: 'Каталог книг — БукРид' },
  { path: 'cart', component: CartComponent, title: 'Корзина — БукРид' },
  { 
    path: 'checkout', 
    component: CheckoutComponent, 
    canActivate: [authGuard], // Защищено authGuard
    title: 'Оформление заказа — БукРид' 
  },
  { 
    path: 'login', 
    component: LoginComponent, 
    canActivate: [guestGuard], // Защищено guestGuard
    title: 'Вход в аккаунт — БукРид' 
  },
  { 
    path: 'register', 
    component: RegisterComponent, 
    canActivate: [guestGuard], // Защищено guestGuard
    title: 'Регистрация — БукРид' 
  },
  { 
    path: 'cabinet', 
    component: CabinetComponent, 
    canActivate: [authGuard], // Защищено authGuard
    title: 'Личный кабинет — БукРид' 
  },
  { path: '**', redirectTo: '' }
];'''
add_code_block(code_routes)

# ----------------- 4. МОДЕЛЬ ДАННЫХ И КЛАССЫ ТОВАРОВ -----------------
add_header("4. ООП моделирование: Классы товаров и начальные данные", level=1)
add_body_p(
    "В соответствии с требованием задания «перенести создание начальных данных класса в файл с самим классом», "
    "в проекте реализован полноценный TypeScript-класс Book с собственным конструктором для инкапсуляции сущности товара. "
    "Массивы начальных демонстрационных данных INITIAL_BOOKS и INITIAL_CATEGORIES вынесены непосредственно в файл модели src/app/models/book.model.ts."
)

code_model = '''// src/app/models/book.model.ts

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

// Создание начальных экземпляров класса в файле с классом:
export const INITIAL_BOOKS: Book[] = [
  new Book({ id: 1, category_id: 1, title: 'Мастер и Маргарита', author: 'Михаил Булгаков', price: 650, old_price: 850, rating: 4.9, is_popular: true, is_promo: true, stock: 15, image: 'master-i-margarita.jpg' }),
  new Book({ id: 2, category_id: 2, title: 'Дюна', author: 'Фрэнк Герберт', price: 920, rating: 4.8, is_popular: true, is_promo: false, stock: 12, image: 'dune.jpg' }),
  new Book({ id: 3, category_id: 2, title: '1984', author: 'Джордж Оруэлл', price: 490, old_price: 620, rating: 4.7, is_popular: true, is_promo: true, stock: 20, image: '1984.jpg' })
  // ... и другие книги каталога
];'''
add_code_block(code_model)

# ----------------- 5. СЕРВЕРНАЯ ЧАСТЬ (PHP REST API) -----------------
add_header("5. Серверная часть (PHP REST API)", level=1)
add_body_p(
    "Серверная часть спроектирована по принципу REST API и не содержит HTML-шаблонов генерации интерфейса. "
    "На стороне PHP реализуются исключительно задачи подключения к базе данных, выполнения параметризованных запросов (PDO), "
    "парсинга входных данных и отправки JSON-ответов."
)

api_table = doc.add_table(rows=1, cols=3)
api_table.alignment = WD_TABLE_ALIGNMENT.CENTER
api_table.autofit = False
api_table.columns[0].width = Inches(1.5)
api_table.columns[1].width = Inches(2.2)
api_table.columns[2].width = Inches(2.8)

h_cells = api_table.rows[0].cells
h_cells[0].text = "Метод и URL"
h_cells[1].text = "Файл скрипта"
h_cells[2].text = "Выполняемая операция"
for c in h_cells:
    set_cell_shading(c, "4338CA")
    p = c.paragraphs[0]
    for r in p.runs:
        r.font.name = 'Arial'
        r.font.size = Pt(10)
        r.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

api_data = [
    ("GET /api/books.php", "backend/api/books.php", "Выборка книг с параметрами поиска (?search), фильтрации по категориям (?category_slug), акциям (?promo=1) и случайного выбора (?random=1)."),
    ("GET /api/categories.php", "backend/api/categories.php", "Выборка перечня жанров с агрегацией количества доступных книг (COUNT)."),
    ("POST /api/auth/register.php", "backend/api/auth/register.php", "Регистрация нового пользователя с валидацией email и хэшированием пароля функцией password_hash(BCRYPT)."),
    ("POST /api/auth/login.php", "backend/api/auth/login.php", "Проверка учетных данных (password_verify) и выдача токена сессии."),
    ("GET /api/auth/profile.php", "backend/api/auth/profile.php", "Получение персональных данных пользователя и истории оформленных заказов."),
    ("POST /api/orders.php", "backend/api/orders.php", "Создание заказа в транзакции БД с сохранением связей в таблицах orders и order_items.")
]

for row in api_data:
    row_cells = api_table.add_row().cells
    for i in range(3):
        row_cells[i].text = row[i]
        p = row_cells[i].paragraphs[0]
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(3)
        for r in p.runs:
            r.font.name = 'Calibri'
            r.font.size = Pt(9.5)

doc.add_paragraph().paragraph_format.space_after = Pt(6)

# ----------------- 6. БАЗА ДАННЫХ И СТРУКТУРА ТАБЛИЦ -----------------
add_header("6. Структура базы данных MySQL (MAMP / phpMyAdmin)", level=1)
add_body_p(
    "База данных bookstore_db разработана в третьей нормальной форме (3NF) и включает следующие таблицы:"
)
db_items = [
    "categories (id, name, slug) — справочник книжных категорий/жанров.",
    "books (id, category_id, title, author, description, price, old_price, rating, is_popular, is_promo, stock, image) — каталог книг с внешним ключом category_id (CASCADE).",
    "users (id, name, email, password, phone, address) — пользователи системы.",
    "orders (id, user_id, customer_name, customer_email, customer_phone, delivery_address, payment_method, comments, total_amount, status) — реестр заказов.",
    "order_items (id, order_id, book_id, title, price, quantity) — позиции в заказе со связью к orders (CASCADE)."
]
for item in db_items:
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(item)
    run.font.name = 'Calibri'
    run.font.size = Pt(10.5)

# ----------------- 7. ТЕСТИРОВАНИЕ РАБОТОСПОСОБНОСТИ -----------------
add_header("7. Тестирование и верификация функционала", level=1)
add_body_p(
    "В ходе сдачи проекта преподавателю могут быть продемонстрированы следующие контрольные сценарии тестирования:"
)
test_scenarios = [
    ("Сценарий 1: Проверка работы Guards.", "При попытке неавторизованного пользователя открыть URL http://localhost:4200/cabinet или http://localhost:4200/checkout срабатывает authGuard, блокирует доступ и осуществляет автоматический редирект на форму /login. После авторизации гостевой гвард guestGuard блокирует повторный вход на страницы /login и /register, перенаправляя пользователя в рабочий кабинет."),
    ("Сценарий 2: Полнофункциональная работа витрины и каталога.", "На главной странице выводятся акционные товары со скидками и блок популярных книг. В каталоге работает фильтрация по категориям, живой поиск по названию/автору и сортировка по цене. При нажатии на карточку открывается модальное окно деталей книги."),
    ("Сценарий 3: Корзина и оформление заказа.", "Товары добавляются в корзину с отображением бейджа в шапке. В корзине реализовано динамическое изменение количества, расчет бесплатной доставки от 2000 руб. и сохранение состояния в localStorage. Заказ отправляется на PHP бэкенд и сохраняется в реляционных таблицах MySQL."),
    ("Сценарий 4: Личный кабинет.", "Пользователь видит актуальную историю своих заказов, составы купленных товаров и их статусы, а также может редактировать свои контактные данные и адрес.")
]

for title, desc in test_scenarios:
    add_body_p(desc, bold_prefix=title + " ")

# ----------------- 8. ЗАКЛЮЧЕНИЕ -----------------
add_header("8. Заключение", level=1)
add_body_p(
    "В результате выполнения работы успешно реализовано современное полнофункциональное веб-приложение книжного интернет-магазина «БукРид». "
    "Все требования технического задания выполнены в полном объеме:\n"
    "1. Клиентская часть переведена на Angular с компонентной архитектурой и реактивным управлением состоянием.\n"
    "2. На PHP оставлена исключительно серверная REST API логика взаимодействия с СУБД MySQL.\n"
    "3. Реализована система разграничения прав доступа с помощью маршрутных гвардов (authGuard и guestGuard).\n"
    "4. Класс товаров Book инкапсулирует создание начальных данных в файле модели.\n"
    "5. Исходный код проекта синхронизирован с системой контроля версий Git и размещен в публичном репозитории GitHub."
)

report_path = r"C:\Users\whyte\.gemini\antigravity\scratch\bookstore\Отчет_по_проекту_Книжный_Интернет_Магазин.docx"
doc.save(report_path)
print("Report successfully saved to:", report_path)
