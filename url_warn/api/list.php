<?php
declare(strict_types=1);
require_once ____DIR____ . '/../config.php';
cors();
require_api_key_if_enabled();

$pdo = db();
$limit = isset($_GET['limit']) ? max(1, min(500, intval($_GET['limit']))) : 50;
$stmt = $pdo->prepare("SELECT url, reason, flags_count, first_flagged_at, last_flagged_at FROM flagged_urls ORDER BY last_flagged_at DESC LIMIT ?");
$stmt->bindValue(1, $limit, PDO::PARAM_INT);
$stmt->execute();
json_out($stmt->fetchAll());