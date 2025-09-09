<?php
require ____DIR____. '/config.php';  // <-- ___DIR___ not DIR
var_dump([
  'DB_HOST'=> DB_HOST,
  'DB_NAME'=> DB_NAME,
  'API_REQUIRE_KEY'=> API_REQUIRE_KEY,
]);
try {
  db()->query('SELECT 1');
  echo "\nDB: OK";
} catch (Throwable $e) {
  echo "\nDB FAIL: " . $e->getMessage();
}