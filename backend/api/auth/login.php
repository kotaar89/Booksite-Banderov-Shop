<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Метод не поддерживается, используйте POST"]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (empty($input['email']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Введите email и пароль"]);
    exit();
}

$email = strtolower(trim($input['email']));
$password = $input['password'];

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT id, name, email, password, phone, address FROM users WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $token = bin2hex(random_bytes(24));
        unset($user['password']);

        echo json_encode([
            "success" => true,
            "message" => "Успешный вход!",
            "token" => $token,
            "user" => $user
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "error" => "Неверный email или пароль"
        ], JSON_UNESCAPED_UNICODE);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Ошибка сервера: " . $e->getMessage()]);
}
