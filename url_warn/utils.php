<?php
declare(strict_types=1);

/* ---------- CORS ---------- */
function cors(): void {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, X-API-Key');
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
}

/* ---------- JSON OUT ---------- */
function json_out(array $data, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_SLASHES);
  exit;
}

/* ---------- DB ---------- */
function db(): PDO {
  static $pdo = null;
  if ($pdo) return $pdo;
  $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
  $pdo = new PDO($dsn, DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
  return $pdo;
}

/* ---------- URL NORMALISATION (keep www, path, query) ---------- */
function normalise_url(string $u): string {
  $u = trim($u);
  if ($u === '') return '';

  // add scheme if missing
  if (!preg_match('~^https?://~i', $u)) $u = 'https://' . $u;

  $p = parse_url($u);
  if (!$p || empty($p['host'])) return '';

  $scheme = strtolower($p['scheme'] ?? 'https');
  $host   = strtolower($p['host']);         // KEEP www (do not strip)

  $port = isset($p['port']) ? (int)$p['port'] : null;
  if (($scheme === 'http' && $port === 80) || ($scheme === 'https' && $port === 443)) $port = null;
  $hostport = $host . ($port ? ':' . $port : '');

  $path  = isset($p['path']) && $p['path'] !== '' ? $p['path'] : '/';
  $query = isset($p['query']) ? ('?' . $p['query']) : '';   // keep query
  // fragment is dropped

  return $scheme . '://' . $hostport . $path . $query;
}

/* ---------- URL HASH ---------- */
function url_hash(string $u): string {
  return hash('sha256', $u);
}

/* ---------- API KEY (optional) ---------- */
function require_api_key_if_enabled(): void {
  if (!API_REQUIRE_KEY) return;
  $key = $_SERVER['HTTP_X_API_KEY'] ?? '';
  if ($key !== API_KEY) json_out(['ok' => false, 'error' => 'forbidden'], 403);
}