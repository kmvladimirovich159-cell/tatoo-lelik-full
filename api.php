<?php
require __DIR__ . '/config.php';

start_admin_session();
$action = $_POST['action'] ?? $_GET['action'] ?? '';

if ($action === 'login') {
    $password = (string)($_POST['password'] ?? '');
    if (hash_equals(ADMIN_PASSWORD, $password)) {
        session_regenerate_id(true);
        $_SESSION['lelkino_admin'] = true;
        json_response(['ok' => true]);
    }
    json_response(['ok' => false, 'message' => 'Неверный пароль.'], 401);
}

if ($action === 'logout') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', $params['secure'], $params['httponly']);
    }
    session_destroy();
    json_response(['ok' => true]);
}

if ($action === 'list') {
    json_response(['ok' => true, 'items' => portfolio_read()]);
}

if (!is_admin()) {
    json_response(['ok' => false, 'message' => 'Требуется вход в админку.'], 403);
}

if ($action === 'delete') {
    $id = (string)($_POST['id'] ?? '');
    $items = portfolio_read();
    $found = false;
    foreach ($items as $i => $item) {
        if (($item['id'] ?? '') === $id) {
            $file = __DIR__ . '/' . ltrim((string)($item['src'] ?? ''), '/');
            if (is_file($file) && strpos(realpath($file) ?: '', realpath(UPLOAD_DIR) ?: '') === 0) {
                @unlink($file);
            }
            array_splice($items, $i, 1);
            $found = true;
            break;
        }
    }
    portfolio_write($items);
    json_response(['ok' => $found, 'items' => $items]);
}

if ($action === 'update') {
    $id = trim((string)($_POST['id'] ?? ''));
    $title = trim((string)($_POST['title'] ?? ''));
    $category = trim((string)($_POST['category'] ?? 'grafika'));
    $allowedCategories = ['minimalism','nadpisi','grafika','floristika','realizm'];
    if (!$id || !$title || !in_array($category, $allowedCategories, true)) {
        json_response(['ok' => false, 'message' => 'Проверь название и категорию.'], 422);
    }
    $items = portfolio_read();
    $updated = false;
    foreach ($items as &$item) {
        if (($item['id'] ?? '') === $id) {
            $item['title'] = mb_substr($title, 0, 120);
            $item['caption'] = $item['title'];
            $item['category'] = $category;
            $updated = true;
            break;
        }
    }
    unset($item);
    portfolio_write($items);
    json_response(['ok' => $updated, 'items' => $items]);
}

if ($action === 'reorder') {
    $ids = $_POST['ids'] ?? [];
    if (!is_array($ids)) json_response(['ok' => false, 'message' => 'Неверный порядок.'], 422);
    $items = portfolio_read();
    $map = [];
    foreach ($items as $item) $map[$item['id']] = $item;
    $new = [];
    foreach ($ids as $id) if (isset($map[$id])) { $new[] = $map[$id]; unset($map[$id]); }
    foreach ($map as $item) $new[] = $item;
    portfolio_write($new);
    json_response(['ok' => true, 'items' => $new]);
}

if ($action === 'upload') {
    if (empty($_FILES['photos'])) json_response(['ok' => false, 'message' => 'Выбери фотографии.'], 422);
    if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);

    $defaultCategory = (string)($_POST['category'] ?? 'grafika');
    $allowedCategories = ['minimalism','nadpisi','grafika','floristika','realizm'];
    if (!in_array($defaultCategory, $allowedCategories, true)) $defaultCategory = 'grafika';

    $files = $_FILES['photos'];
    $names = is_array($files['name']) ? $files['name'] : [$files['name']];
    $tmpNames = is_array($files['tmp_name']) ? $files['tmp_name'] : [$files['tmp_name']];
    $errors = is_array($files['error']) ? $files['error'] : [$files['error']];
    $sizes = is_array($files['size']) ? $files['size'] : [$files['size']];

    $items = portfolio_read();
    $added = [];
    $finfo = new finfo(FILEINFO_MIME_TYPE);

    foreach ($names as $idx => $originalName) {
        if (($errors[$idx] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) continue;
        $tmp = $tmpNames[$idx] ?? '';
        $size = (int)($sizes[$idx] ?? 0);
        if (!$tmp || $size <= 0 || $size > MAX_UPLOAD_SIZE || !is_uploaded_file($tmp)) continue;
        $mime = $finfo->file($tmp);
        if (!isset(ALLOWED_MIMES[$mime])) continue;
        $ext = ALLOWED_MIMES[$mime];
        $id = bin2hex(random_bytes(8));
        $filename = date('Ymd_His') . '_' . $id . '.' . $ext;
        $destination = UPLOAD_DIR . $filename;
        if (!move_uploaded_file($tmp, $destination)) continue;
        @chmod($destination, 0644);

        $base = pathinfo((string)$originalName, PATHINFO_FILENAME);
        $title = preg_replace('/[_-]+/', ' ', $base) ?: 'Новая работа';
        $title = trim(mb_substr($title, 0, 120));
        $item = [
            'id' => $id,
            'src' => 'uploads/' . $filename,
            'title' => $title,
            'caption' => $title,
            'category' => $defaultCategory,
            'created' => date('c'),
        ];
        $items[] = $item;
        $added[] = $item;
    }

    portfolio_write($items);
    json_response(['ok' => count($added) > 0, 'added' => count($added), 'items' => $items, 'message' => count($added) ? 'Фото добавлены.' : 'Не удалось загрузить фотографии. Проверь формат и размер.']);
}

json_response(['ok' => false, 'message' => 'Неизвестное действие.'], 400);
