// Конфигурация подключения к PHP Backend
// Если вы запускаете PHP через встроенный сервер: php -S localhost:8000 -t backend
// то адрес: 'http://localhost:8000/api'
// Если через MAMP (в папке htdocs):
// то адрес: 'http://localhost/bookstore/backend/api' (или 'http://localhost:8888/bookstore/backend/api')

export const API_CONFIG = {
  // Вы можете быстро переключить URL под вашу конфигурацию MAMP:
  baseUrl: 'http://localhost:8000/api',
  // Альтернативный путь для MAMP htdocs:
  mampUrl: 'http://localhost/bookstore/backend/api'
};
