<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    if ($userId <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Не указан ID пользователя"]);
        exit();
    }

    try {
        $stmt = $db->prepare("SELECT id, name, email, phone, address, created_at FROM users WHERE id = :id LIMIT 1");
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Пользователь не найден"]);
            exit();
        }

        // Загрузка заказов пользователя
        $orderStmt = $db->prepare("SELECT * FROM orders WHERE user_id = :user_id ORDER BY created_at DESC");
        $orderStmt->bindParam(':user_id', $userId);
        $orderStmt->execute();
        $orders = $orderStmt->fetchAll();

        // Для каждого заказа подгружаем его товары
        foreach ($orders as &$order) {
            $itemsStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = :order_id");
            $itemsStmt->bindParam(':order_id', $order['id']);
            $itemsStmt->execute();
            $order['items'] = $itemsStmt->fetchAll();
        }

        echo json_encode([
            "success" => true,
            "user" => $user,
            "orders" => $orders
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Ошибка сервера: " . $e->getMessage()]);
    }
    exit();
}

if ($method === 'POST' || $method === 'PUT') {
    $input = json_decode(file_get_contents("php://input"), true);
    $userId = isset($input['id']) ? intval($input['id']) : 0;

    if ($userId <= 0 || empty($input['name'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Некорректные данные для обновления"]);
        exit();
    }

    $name = trim($input['name']);
    $phone = isset($input['phone']) ? trim($input['phone']) : null;
    $address = isset($input['address']) ? trim($input['address']) : null;

    try {
        $stmt = $db->prepare("UPDATE users SET name = :name, phone = :phone, address = :address WHERE id = :id");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':id', $userId);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Данные профиля обновлены",
            "user" => [
                "id" => $userId,
                "name" => $name,
                "phone" => $phone,
                "address" => $address
            ]
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Ошибка при сохранении: " . $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "error" => "Метод не поддерживается"]);
