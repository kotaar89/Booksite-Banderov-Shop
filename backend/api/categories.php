<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT c.id, c.name, c.slug, COUNT(b.id) as book_count 
              FROM categories c 
              LEFT JOIN books b ON c.id = b.category_id 
              GROUP BY c.id, c.name, c.slug 
              ORDER BY c.id ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $categories = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $categories
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Не удалось загрузить категории: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
