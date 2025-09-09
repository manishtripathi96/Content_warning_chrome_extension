<?php
declare(strict_types=1);

require_once __DIR__ . '/utils.php';

// Hardcode for now to remove .env issues
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'url_warn');
define('DB_USER', 'root');
define('DB_PASS', '');

define('API_REQUIRE_KEY', false);
define('API_KEY', '');

// Convert PHP notices/warnings into exceptions so we can JSON them
set_error_handler(function ($severity, $message, $file, $line) {
  if (!(error_reporting() & $severity)) return false;
  throw new ErrorException($message, 0, $severity, $file, $line);
});