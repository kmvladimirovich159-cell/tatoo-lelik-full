<?php
// LELKINO TATOO — настройка админки
// ВАЖНО: после первого входа поменяйте ADMIN_PASSWORD на свой пароль.

const ADMIN_PASSWORD = 'Lelkino2026!';
const DATA_FILE = __DIR__ . '/data/portfolio.json';
const UPLOAD_DIR = __DIR__ . '/uploads/';
const MAX_UPLOAD_SIZE = 12 * 1024 * 1024; // 12 MB на один файл

const ALLOWED_MIMES = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
];

function start_admin_session(): void {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_name('lelkino_admin');
        session_start([
            'cookie_httponly' => true,
            'cookie_samesite' => 'Lax',
            'cookie_secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        ]);
    }
}

function is_admin(): bool {
    start_admin_session();
    return !empty($_SESSION['lelkino_admin']);
}

function json_response(array $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}

function portfolio_read(): array {
    if (!is_file(DATA_FILE)) return [];
    $raw = file_get_contents(DATA_FILE);
    $data = json_decode($raw ?: '[]', true);
    return is_array($data) ? $data : [];
}

function portfolio_write(array $items): void {
    if (!is_dir(dirname(DATA_FILE))) mkdir(dirname(DATA_FILE), 0755, true);
    file_put_contents(DATA_FILE, json_encode(array_values($items), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT), LOCK_EX);
}

function slug_text(string $text): string {
    $text = trim($text);
    $text = preg_replace('/[^\p{L}\p{N}]+/u', '-', $text) ?? 'work';
    $text = trim($text, '-');
    return $text !== '' ? mb_strtolower($text) : 'work';
}
