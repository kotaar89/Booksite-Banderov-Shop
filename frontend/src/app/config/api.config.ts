// frontend/src/app/config/api.config.ts
// Конфигурация подключения к PHP Backend в MAMP

export const API_CONFIG = {
  // Прямой путь к вашему бэкенду в MAMP (порт 8888)
  baseUrl: 'http://localhost:8888/backend/api',
  // Запасной путь для встроенного php -S:
  fallbackUrl: 'http://localhost:8000/api'
};
