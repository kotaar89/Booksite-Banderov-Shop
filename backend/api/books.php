<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Получение одной книги по ID
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $query = "SELECT b.*, c.name as category_name, c.slug as category_slug 
                  FROM books b 
                  JOIN categories c ON b.category_id = c.id 
                  WHERE b.id = :id LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $book = $stmt->fetch();

        if ($book) {
            echo json_encode([
                "success" => true,
                "data" => $book
            ], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(404);
            echo json_encode([
                "success" => false,
                "error" => "Книга не найдена"
            ], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }

    // Фильтрация списка книг
    $sql = "SELECT b.*, c.name as category_name, c.slug as category_slug 
            FROM books b 
            JOIN categories c ON b.category_id = c.id 
            WHERE 1=1";
    $params = [];

    // Поиск по названию или автору
    if (!empty($_GET['search'])) {
        $search = '%' . trim($_GET['search']) . '%';
        $sql .= " AND (b.title LIKE :search OR b.author LIKE :search OR b.description LIKE :search)";
        $params[':search'] = $search;
    }

    // Фильтр по категории (ID)
    if (!empty($_GET['category_id'])) {
        $sql .= " AND b.category_id = :category_id";
        $params[':category_id'] = intval($_GET['category_id']);
    }

    // Фильтр по категории (slug)
    if (!empty($_GET['category_slug']) && $_GET['category_slug'] !== 'all') {
        $sql .= " AND c.slug = :category_slug";
        $params[':category_slug'] = trim($_GET['category_slug']);
    }

    // Только акции (со скидкой)
    if (isset($_GET['promo']) && $_GET['promo'] == '1') {
        $sql .= " AND b.is_promo = 1";
    }

    // Только популярные
    if (isset($_GET['popular']) && $_GET['popular'] == '1') {
        $sql .= " AND b.is_popular = 1";
    }

    // Сортировка
    if (isset($_GET['random']) && $_GET['random'] == '1') {
        $sql .= " ORDER BY RAND()";
    } else {
        $sql .= " ORDER BY b.id DESC";
    }

    // Лимит
    if (!empty($_GET['limit'])) {
        $limit = intval($_GET['limit']);
        $sql .= " LIMIT " . $limit;
    }

    $stmt = $db->prepare($sql);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->execute();
    $books = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "count" => count($books),
        "data" => $books
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Ошибка базы данных: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
