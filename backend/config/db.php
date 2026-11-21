<?php
// backend/config/db.php
// Подключение к базе данных MySQL (MAMP / phpMyAdmin)

class Database {
    // В MAMP на Mac порт MySQL по умолчанию: 8889
    // В MAMP на Windows: 3306
    // Пользователь: 'root', пароль: 'root' (или пустой '')
    public $conn = null;

    public function getConnection() {
        if ($this->conn !== null) {
            return $this->conn;
        }

        $dbName = "bookstore_db";

        // Варианты подключения для MAMP (Mac и Windows)
        $attempts = [
            // Mac MAMP (порт 8889)
            ['dsn' => "mysql:host=127.0.0.1;port=8889;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => 'root'],
            // Mac MAMP через сокет
            ['dsn' => "mysql:unix_socket=/Applications/MAMP/tmp/mysql/mysql.sock;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => 'root'],
            // Стандартный MySQL порт 3306
            ['dsn' => "mysql:host=127.0.0.1;port=3306;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => 'root'],
            ['dsn' => "mysql:host=127.0.0.1;port=3306;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => ''],
            ['dsn' => "mysql:host=localhost;port=3306;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => 'root'],
            ['dsn' => "mysql:host=localhost;port=8889;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => 'root'],
        ];

        $lastError = null;
        foreach ($attempts as $cfg) {
            try {
                $this->conn = new PDO($cfg['dsn'], $cfg['user'], $cfg['pass'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::ATTR_TIMEOUT => 2, // Быстрый таймаут 2 сек, чтобы не висело бесконечно
                ]);
                return $this->conn;
            } catch (PDOException $e) {
                $lastError = $e->getMessage();
            }
        }

        // Если не удалось подключиться
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "error" => "Ошибка подключения к MySQL в MAMP. Убедитесь, что сервер MySQL запущен в MAMP и импортирован database/schema.sql в phpMyAdmin.",
            "details" => $lastError
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}
