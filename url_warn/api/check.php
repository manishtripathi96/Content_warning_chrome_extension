<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';
cors();

try {
  $pdo = db();

  $url = isset($_GET['url']) ? trim((string)$_GET['url']) : '';
  $norm = normalise_url($url);
  if ($norm === '') json_out(['warn' => false, 'error' => 'invalid_url'], 400);
  $h = url_hash($norm);

  $stmt = $pdo->prepare("SELECT url, reason, flags_count, first_flagged_at, last_flagged_at
                         FROM flagged_urls WHERE url_hash=?");
  $stmt->execute([$h]);
  $row = $stmt->fetch();

  if (!$row) json_out(['warn' => false]);

  json_out([
    'warn' => true,
    'flag' => [
      'url' => $row['url'],
      'reason' => $row['reason'],
      'count' => (int)$row['flags_count'],
      'first_flagged_at' => $row['first_flagged_at'],
      'last_flagged_at' => $row['last_flagged_at'],
    ]
  ]);
} catch (Throwable $e) {
  json_out(['warn' => false, 'error' => 'server_error', 'message' => $e->getMessage()], 500);
}