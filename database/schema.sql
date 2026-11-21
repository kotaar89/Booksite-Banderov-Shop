-- ============================================================
-- База данных интернет-магазина книг "БукРид / BookRead"
-- Для импорта через MAMP / phpMyAdmin
-- ============================================================

CREATE DATABASE IF NOT EXISTS `bookstore_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bookstore_db`;

-- 1. Таблица категорий
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `books`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Таблица книг
CREATE TABLE `books` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `author` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `old_price` DECIMAL(10, 2) DEFAULT NULL,
    `rating` DECIMAL(2, 1) DEFAULT 5.0,
    `is_popular` TINYINT(1) DEFAULT 0,
    `is_promo` TINYINT(1) DEFAULT 0,
    `stock` INT DEFAULT 10,
    `image` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Таблица пользователей
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(30) DEFAULT NULL,
    `address` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Таблица заказов
CREATE TABLE `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT DEFAULT NULL,
    `customer_name` VARCHAR(150) NOT NULL,
    `customer_email` VARCHAR(150) NOT NULL,
    `customer_phone` VARCHAR(30) NOT NULL,
    `delivery_address` TEXT NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL DEFAULT 'card',
    `comments` TEXT DEFAULT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Новый',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Позиции заказа
CREATE TABLE `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `book_id` INT DEFAULT NULL,
    `title` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- ============================================================

-- Категории
INSERT INTO `categories` (`id`, `name`, `slug`) VALUES
(1, 'Классическая литература', 'classics'),
(2, 'Фантастика и фэнтези', 'sci-fi-fantasy'),
(3, 'Бизнес и саморазвитие', 'business'),
(4, 'Детективы и триллеры', 'detective'),
(5, 'Современная проза', 'contemporary');

-- Книги
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `description`, `price`, `old_price`, `rating`, `is_popular`, `is_promo`, `stock`, `image`) VALUES
(1, 1, 'Мастер и Маргарита', 'Михаил Булгаков', 'Бессмертный роман о добре и зле, любви и творчестве, визите Воланда в Москву 1930-х годов.', 650.00, 850.00, 4.9, 1, 1, 15, 'master-i-margarita.jpg'),
(2, 2, 'Дюна', 'Фрэнк Герберт', 'Грандиозная космическая эпопея об Арракисе, пустынной планете пряности и песка.', 920.00, NULL, 4.8, 1, 0, 12, 'dune.jpg'),
(3, 2, '1984', 'Джордж Оруэлл', 'Культовая антиутопия о тоталитарном государстве, Министерстве Правды и Старшем Брате.', 490.00, 620.00, 4.7, 1, 1, 20, '1984.jpg'),
(4, 3, 'Атомные привычки', 'Джеймс Клир', 'Практическое руководство по формированию полезных привычек и избавлению от вредных.', 890.00, NULL, 4.9, 1, 0, 8, 'atomic-habits.jpg'),
(5, 4, 'Убийство в Восточном экспрессе', 'Агата Кристи', 'Знаменитое расследование Эркюля Пуаро в застрявшем посреди метели поезде.', 530.00, 700.00, 4.6, 1, 1, 14, 'orient-express.jpg'),
(6, 1, 'Преступление и наказание', 'Федор Достоевский', 'Психологическая драма Родиона Раскольникова о границах дозволенного и муках совести.', 580.00, NULL, 4.8, 0, 0, 18, 'prestuplenie-i-nakazanie.jpg'),
(7, 2, 'Гарри Поттер и философский камень', 'Дж. К. Роулинг', 'Начало легендарной истории о мальчике-волшебнике и школе магии Хогвартс.', 950.00, 1200.00, 5.0, 1, 1, 25, 'harry-potter-1.jpg'),
(8, 3, 'Думай медленно... решай быстро', 'Даниэль Канеман', 'Книга нобелевского лауреата об особенностях человеческого мышления и принятии решений.', 1100.00, NULL, 4.7, 0, 0, 7, 'thinking-fast-and-slow.jpg'),
(9, 4, 'Шерлок Холмс: Этюд в багровых тонах', 'Артур Конан Дойл', 'Первое дело гениального сыщика с Бейкер-стрит и его верного спутника доктора Ватсона.', 450.00, 590.00, 4.8, 1, 1, 16, 'sherlock-holmes.jpg'),
(10, 5, 'Цветы для Элджернона', 'Дэниел Киз', 'Трогательная история умственно отсталого Чарли Гордона, над которым проводят научный эксперимент.', 620.00, NULL, 4.9, 1, 0, 11, 'flowers-for-algernon.jpg'),
(11, 2, 'Ведьмак: Последнее желание', 'Анджей Сапковский', 'Первая книга саги о Геральте из Ривии, профессиональном охотнике на чудовищ.', 840.00, 990.00, 4.8, 0, 1, 9, 'witcher-1.jpg'),
(12, 3, 'Богатый папа, бедный папа', 'Роберт Кийосаки', 'Основы финансовой грамотности и мышления, меняющие подход к деньгам и инвестициям.', 740.00, NULL, 4.5, 0, 0, 13, 'rich-dad-poor-dad.jpg');

-- Тестовый пользователь (пароль: 123456)
-- Хэш сгенерирован password_hash('123456', PASSWORD_BCRYPT)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `address`) VALUES
(1, 'Анна Смирнова', 'test@example.com', '$2y$10$wK1WwI.y.YF/t4wH0q6jMeGz3Fm3dC8pLwM1g5mN1T0.RjC8K7W6e', '+7 (999) 123-45-67', 'г. Москва, ул. Ленина, д. 10, кв. 25');
