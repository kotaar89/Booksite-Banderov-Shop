<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Метод не поддерживается, используйте POST"]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (empty($input['name']) || empty($input['email']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Пожалуйста, заполните имя, email и пароль"]);
    exit();
}

$name = trim($input['name']);
$email = strtolower(trim($input['email']));
$password = $input['password'];
$phone = isset($input['phone']) ? trim($input['phone']) : null;
$address = isset($input['address']) ? trim($input['address']) : null;

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Некорректный адрес электронной почты"]);
    exit();
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Пароль должен содержать минимум 6 символов"]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    // Проверка существования пользователя
    $checkQuery = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $email);
    $checkStmt->execute();

    if ($checkStmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["success" => false, "error" => "Пользователь с таким email уже зарегистрирован"]);
        exit();
    }

    // Хеширование пароля
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Добавление в базу
    $insertQuery = "INSERT INTO users (name, email, password, phone, address) VALUES (:name, :email, :password, :phone, :address)";
    $stmt = $db->prepare($insertQuery);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':address', $address);
    $stmt->execute();

    $newUserId = (int)$db->lastInsertId();

    // Простой токен сессии (для учебного/базового проекта)
    $token = bin2hex(random_bytes(24));

    echo json_encode([
        "success" => true,
        "message" => "Регистрация прошла успешно!",
        "token" => $token,
        "user" => [
            "id" => $newUserId,
            "name" => $name,
            "email" => $email,
            "phone" => $phone,
            "address" => $address
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Ошибка сервера: " . $e->getMessage()]);
}
