<?php
declare(strict_types=1);

/* ----- SAFETY NET: always return JSON, even on PHP fatals ----- */
header('Content-Type: application/json; charset=utf-8');
set_error_handler(function ($severity, $message, $file, $line) {
  if (!(error_reporting() & $severity)) return false;
  throw new ErrorException($message, 0, $severity, $file, $line);
});
register_shutdown_function(function () {
  $e = error_get_last();
  if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
    http_response_code(500);
    echo json_encode(['ok'=>false,'error'=>'fatal','message'=>$e['message']], JSON_UNESCAPED_SLASHES);
  }
});

/* ----- BOOTSTRAP ----- */
require_once __DIR__ . '/../config.php';   // MUST be _DIR_ (double underscores)
cors();
require_api_key_if_enabled();

try {
  $pdo = db();

  // Parse JSON body
  $raw  = file_get_contents('php://input') ?: '';
  $body = json_decode($raw, true);
  if (!is_array($body)) {
    json_out(['ok' => false, 'error' => 'invalid_json'], 400);
  }

  $url    = trim((string)($body['url'] ?? ''));
  $reason = trim((string)($body['reason'] ?? ''));

  // Normalize + validate
  $norm = normalise_url($url);
  if ($norm === '') {
    json_out(['ok' => false, 'error' => 'invalid_url'], 400);
  }
  $h = url_hash($norm);
  error_log("FLAG NORM=" . $norm . " HASH=" . $h);

  // Upsert
  $pdo->beginTransaction();
  $stmt = $pdo->prepare("
    INSERT INTO flagged_urls (url, url_hash, reason, flags_count, first_flagged_at, last_flagged_at)
    VALUES (?, ?, ?, 1, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      reason = VALUES(reason),
      last_flagged_at = NOW(),
      flags_count = flags_count + 1
  ");
  $stmt->execute([$norm, $h, $reason]);

  // Read back the row
  $sel = $pdo->prepare("
    SELECT url, reason, flags_count, first_flagged_at, last_flagged_at
    FROM flagged_urls
    WHERE url_hash = ?
  ");
  $sel->execute([$h]);
  $row = $sel->fetch(PDO::FETCH_ASSOC);

  $pdo->commit();

  if (!$row) {
    json_out([
      'ok'  => true,
      'flag'=> [
        'url'             => $norm,
        'reason'          => $reason,
        'count'           => 1,
        'first_flagged_at'=> date('Y-m-d H:i:s'),
        'last_flagged_at' => date('Y-m-d H:i:s'),
      ]
    ]);
  }

  json_out([
    'ok'  => true,
    'flag'=> [
      'url'             => $row['url'],
      'reason'          => $row['reason'],
      'count'           => (int)$row['flags_count'],
      'first_flagged_at'=> $row['first_flagged_at'],
      'last_flagged_at' => $row['last_flagged_at'],
    ]
  ]);

} catch (Throwable $e) {
  if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) $pdo->rollBack();
  json_out(['ok' => false, 'error' => 'server_error', 'message' => $e->getMessage()], 500);
}