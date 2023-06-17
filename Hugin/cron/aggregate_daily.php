<?php
namespace Hugin;

require_once __DIR__ . '/../src/helpers/Config.php';
require_once __DIR__ . '/../src/helpers/Db.php';

if (!empty(getenv('OVERRIDE_CONFIG_PATH'))) {
    $configPath = getenv('OVERRIDE_CONFIG_PATH');
} else {
    $configPath = __DIR__ . '/../config/index.php';
}
$config = new Config($configPath);
$db = new Db($config);

$from = date('Y-m-d 00:00:00', time() - 24 * 60 * 60);
$to = date('Y-m-d 00:00:00', time());
$events = $db->table('event')->rawQuery(<<<QUERY
    SELECT * from event WHERE created_at BETWEEN '{$from}' AND '{$to}'
QUERY)->findArray();

$uniqs = $db->table('event')->rawQuery(<<<QUERY
    SELECT site_id, count(distinct session_id) as cnt from event WHERE created_at BETWEEN '{$from}' AND '{$to}' group by site_id
QUERY)->findArray();

$uniqsBySite = [];
foreach ($uniqs as $uniq) {
    $uniqsBySite[$uniq['site_id']] = $uniq['cnt'];
}

$sites = [];

foreach ($events as $ev) {
    $siteId = $ev['site_id'];
    if (empty($sites[$siteId])) {
        $sites[$siteId] = [
            'event_count' => 0,
            'country' => [],
            'city' => [],
            'os' => [],
            'browser' => [],
            'device' => [],
            'screen' => [],
            'language' => [],
            'event_type' => [],
        ];
    }
    $sites[$siteId]['event_count']++;
    foreach (['country', 'city', 'os', 'device', 'browser', 'screen', 'language', 'event_type'] as $k) {
        if (empty($sites[$siteId][$k][$ev[$k]])) {
            $sites[$siteId][$k][$ev[$k]] = 0;
        }
        $sites[$siteId][$k][$ev[$k]]++;
    }
}

$dataToInsert = [];
foreach ($sites as $siteId => $data) {
    $dataToInsert []= [
        'day' => $from,
        'event_count' => $data['event_count'],
        'uniq_count' => $uniqsBySite[$siteId],
        'site_id' => $siteId,
        'country' => json_encode($data['country']),
        'city' => json_encode($data['city']),
        'os' => json_encode($data['os']),
        'browser' => json_encode($data['browser']),
        'device' => json_encode($data['device']),
        'screen' => json_encode($data['screen']),
        'language' => json_encode($data['language']),
        'event_type' => json_encode($data['event_type']),
    ];
}

try {
    if (!$db->upsertQuery('aggregate_day', $dataToInsert, ['day', 'site_id'])) {
        throw new \Exception('Upsert of data to aggregated days table failed');
    }
    // Clean up old events that were processed in previous iteration, e.g. older than 24h
    $db->rawExec(<<<QUERY
    DELETE FROM event WHERE created_at < '{$from}'
QUERY);
} catch (\Exception $e) {
    trigger_error($e->getMessage());
}
