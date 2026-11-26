<?php
// backend/api/test_db.php
// Тестовый скрипт для мгновенной проверки подключения к MySQL из браузера
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$database = new Database();
$db = $database->getConnection();

try {
    // 1. Проверяем список таблиц
    $tablesStmt = $db->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

    // 2. Список пользователей в базе данных
    $usersStmt = $db->query("SELECT id, name, email, phone, created_at FROM users");
    $users = $usersStmt->fetchAll();

    // 3. Количество книг
    $booksStmt = $db->query("SELECT COUNT(*) as count FROM books");
    $bookCount = $booksStmt->fetch()['count'];

    // 4. Количество заказов
    $ordersStmt = $db->query("SELECT COUNT(*) as count FROM orders");
    $orderCount = $ordersStmt->fetch()['count'];

    echo json_encode([
        "success" => true,
        "message" => "УСПЕХ! Подключение к MySQL в MAMP работает идеально!",
        "database" => "bookstore_db",
        "tables" => $tables,
        "users_count" => count($users),
        "users" => $users,
        "books_count" => (int)$bookCount,
        "orders_count" => (int)$orderCount
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Ошибка выполнения запроса: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
