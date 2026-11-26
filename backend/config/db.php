<?php
// backend/config/db.php
// Подключение к базе данных MySQL (MAMP / phpMyAdmin)

class Database {
    // В MAMP на Mac порт MySQL по умолчанию: 8889 (сокет: /Applications/MAMP/tmp/mysql/mysql.sock)
    // В MAMP на Windows: 3306
    // Пользователь: 'root', пароль: 'root' (или пустой '')
    public $conn = null;

    public function getConnection() {
        if ($this->conn !== null) {
            return $this->conn;
        }

        $dbName = "bookstore_db";

        // Варианты подключения для MAMP (Mac и Windows)
        // В phpMyAdmin на Mac указано: "Localhost via UNIX socket"
        // Поэтому для Mac MAMP первым делом пробуем сокет и порт 8889
        $attempts = [
            // 1. Mac MAMP через UNIX-сокет (пароль 'root') — именно так работает phpMyAdmin на Mac!
            ['dsn' => "mysql:unix_socket=/Applications/MAMP/tmp/mysql/mysql.sock;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => 'root'],
            // 2. Mac MAMP через UNIX-сокет (без пароля)
            ['dsn' => "mysql:unix_socket=/Applications/MAMP/tmp/mysql/mysql.sock;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => ''],
            // 3. Стандартный UNIX-сокет /tmp/mysql.sock
            ['dsn' => "mysql:unix_socket=/tmp/mysql.sock;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => 'root'],
            // 4. Mac MAMP через localhost:8889 (пароль 'root')
            ['dsn' => "mysql:host=localhost;port=8889;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => 'root'],
            // 5. Mac MAMP через localhost:8889 (без пароля)
            ['dsn' => "mysql:host=localhost;port=8889;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => ''],
            // 6. Mac MAMP через 127.0.0.1:8889 (пароль 'root')
            ['dsn' => "mysql:host=127.0.0.1;port=8889;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => 'root'],
            // 7. Mac MAMP через 127.0.0.1:8889 (без пароля)
            ['dsn' => "mysql:host=127.0.0.1;port=8889;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => ''],
            // 8. Стандартный порт MySQL 3306 (для Windows MAMP или обычного MySQL)
            ['dsn' => "mysql:host=127.0.0.1;port=3306;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => 'root'],
            ['dsn' => "mysql:host=127.0.0.1;port=3306;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => ''],
            ['dsn' => "mysql:host=localhost;port=3306;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => 'root'],
            ['dsn' => "mysql:host=localhost;port=3306;dbname={$dbName};charset=utf8mb4", 'user' => 'root', 'pass' => ''],
        ];

        $errors = [];
        foreach ($attempts as $cfg) {
            try {
                $this->conn = new PDO($cfg['dsn'], $cfg['user'], $cfg['pass'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::ATTR_TIMEOUT => 2,
                ]);
                return $this->conn;
            } catch (PDOException $e) {
                $errors[] = $cfg['dsn'] . " [user=" . $cfg['user'] . "] => " . $e->getMessage();
            }
        }

        // Если ни один вариант не подошел
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "error" => "Ошибка подключения к MySQL в MAMP. Убедитесь, что сервер MySQL запущен в MAMP и база данных bookstore_db создана.",
            "details" => $errors
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}
