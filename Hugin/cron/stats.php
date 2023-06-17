<?php
namespace Hugin;

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Db.php';

if (!empty(getenv('OVERRIDE_CONFIG_PATH'))) {
    $configPath = getenv('OVERRIDE_CONFIG_PATH');
} else {
    $configPath = __DIR__ . '/../config/index.php';
}
$config = new Config($configPath);
$db = new Db($config);

$from = date('d-m-Y 00:00:00', time() - 24 * 60 * 60);
$to = date('d-m-Y 00:00:00', time());
$events = $db->table('event')->rawQuery(<<<QUERY
    SELECT * from event WHERE created_at BETWEEN "{$from}" AND "{$to}"
QUERY)->findArray();

$uniqs = $db->table('event')->rawQuery(<<<QUERY
    SELECT count(*) as cnt from event WHERE created_at BETWEEN "{$from}" AND "{$to}" group by session_id
QUERY)->findArray();

$aggregates = [
    'day' => $from,
    'event_count' => count($events),
    'uniq_count' => $uniqs[0]['cnt'],
    'site_id' => [],
    'countries' => [],
    'cities' => [],
    'os' => [],
    'devices' => [],
    'screens' => [],
    'languages' => [],
    'event_type' => [],
    'event_meta' => [],
];

