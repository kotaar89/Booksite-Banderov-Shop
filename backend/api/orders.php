<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Создание заказа
if ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);

    if (empty($input['customer_name']) || empty($input['customer_phone']) || empty($input['delivery_address']) || empty($input['items'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Заполните имя, телефон, адрес доставки и добавьте товары"]);
        exit();
    }

    $userId = !empty($input['user_id']) ? intval($input['user_id']) : null;
    $customerName = trim($input['customer_name']);
    $customerEmail = !empty($input['customer_email']) ? trim($input['customer_email']) : '';
    $customerPhone = trim($input['customer_phone']);
    $deliveryAddress = trim($input['delivery_address']);
    $paymentMethod = !empty($input['payment_method']) ? trim($input['payment_method']) : 'При получении';
    $comments = !empty($input['comments']) ? trim($input['comments']) : null;
    $items = $input['items'];

    if (!is_array($items) || count($items) === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Корзина пуста"]);
        exit();
    }

    // Расчет общей суммы
    $totalAmount = 0.0;
    foreach ($items as $item) {
        $price = floatval($item['price']);
        $qty = intval($item['quantity']);
        if ($qty <= 0) $qty = 1;
        $totalAmount += $price * $qty;
    }

    try {
        $db->beginTransaction();

        $orderSql = "INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, delivery_address, payment_method, comments, total_amount, status)
                     VALUES (:user_id, :customer_name, :customer_email, :customer_phone, :delivery_address, :payment_method, :comments, :total_amount, 'Новый')";
        $stmt = $db->prepare($orderSql);
        $stmt->bindParam(':user_id', $userId, $userId ? PDO::PARAM_INT : PDO::PARAM_NULL);
        $stmt->bindParam(':customer_name', $customerName);
        $stmt->bindParam(':customer_email', $customerEmail);
        $stmt->bindParam(':customer_phone', $customerPhone);
        $stmt->bindParam(':delivery_address', $deliveryAddress);
        $stmt->bindParam(':payment_method', $paymentMethod);
        $stmt->bindParam(':comments', $comments);
        $stmt->bindParam(':total_amount', $totalAmount);
        $stmt->execute();

        $orderId = (int)$db->lastInsertId();

        // Добавляем товары заказа
        $itemSql = "INSERT INTO order_items (order_id, book_id, title, price, quantity) VALUES (:order_id, :book_id, :title, :price, :quantity)";
        $itemStmt = $db->prepare($itemSql);

        foreach ($items as $item) {
            $bookId = !empty($item['id']) ? intval($item['id']) : (!empty($item['book_id']) ? intval($item['book_id']) : null);
            $title = $item['title'];
            $price = floatval($item['price']);
            $quantity = intval($item['quantity'] ?? 1);

            $itemStmt->bindParam(':order_id', $orderId, PDO::PARAM_INT);
            $itemStmt->bindParam(':book_id', $bookId, $bookId ? PDO::PARAM_INT : PDO::PARAM_NULL);
            $itemStmt->bindParam(':title', $title);
            $itemStmt->bindParam(':price', $price);
            $itemStmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
            $itemStmt->execute();
        }

        $db->commit();

        echo json_encode([
            "success" => true,
            "order_id" => $orderId,
            "total_amount" => $totalAmount,
            "message" => "Заказ #{$orderId} успешно создан!"
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Ошибка оформления заказа: " . $e->getMessage()]);
    }
    exit();
}

// Получение списка заказов
if ($method === 'GET') {
    if (isset($_GET['user_id'])) {
        $userId = intval($_GET['user_id']);
        try {
            $stmt = $db->prepare("SELECT * FROM orders WHERE user_id = :user_id ORDER BY created_at DESC");
            $stmt->bindParam(':user_id', $userId);
            $stmt->execute();
            $orders = $stmt->fetchAll();

            foreach ($orders as &$order) {
                $itemsStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = :order_id");
                $itemsStmt->bindParam(':order_id', $order['id']);
                $itemsStmt->execute();
                $order['items'] = $itemsStmt->fetchAll();
            }

            echo json_encode(["success" => true, "data" => $orders], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Ошибка базы данных: " . $e->getMessage()]);
        }
        exit();
    }
}

http_response_code(405);
echo json_encode(["success" => false, "error" => "Метод не поддерживается"]);
