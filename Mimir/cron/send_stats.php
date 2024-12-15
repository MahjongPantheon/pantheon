<?php

namespace Mimir;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/Config.php';
require_once __DIR__ . '/../src/Meta.php';
require_once __DIR__ . '/../src/Db.php';

if (!empty(getenv('OVERRIDE_CONFIG_PATH'))) {
    $configPath = getenv('OVERRIDE_CONFIG_PATH');
} else {
    $configPath = __DIR__ . '/../config/index.php';
}

try {
    $config = new Config($configPath);
    date_default_timezone_set($config->getStringValue('serverDefaultTimezone') ?: 'UTC');
    $db = new Db($config);

    $playedGames = $db->table('session')
        ->rawQuery("SELECT COUNT(*) as cnt from session WHERE status = 'inprogress'")
        ->findArray()['cnt'];
    $staleGames = $db->table('session')
        ->rawQuery("SELECT COUNT(*) as cnt from session WHERE status = 'inprogress' AND start_date < NOW() - INTERVAL '1' DAY")
        ->findArray()['cnt'];
    $playedRounds = $db->table('round')
        ->rawQuery("SELECT COUNT(*) from round WHERE end_date > NOW() - INTERVAL '1' MINUTE")
        ->findArray()['cnt'];

    $options = [
        'http' => [
            'method' => 'POST',
            'content' => json_encode([
                ['m' => 'played_games', 'v' => $playedGames , 's' => 'mimir'],
                ['m' => 'stale_games', 'v' => $staleGames , 's' => 'mimir'],
                ['m' => 'played_rounds', 'v' => $playedRounds , 's' => 'mimir'],
            ]),
            'header'=>  "Content-Type: application/json\r\n"
        ]
    ];

    $context  = stream_context_create($options);
    $result = file_get_contents($config->getStringValue('huginUrl') . '/addMetric', false, $context);
    if ($result !== 'ok') {
        throw new \Exception('Failed to send stats to Hugin!');
    }
} catch (\Exception $e) {
    echo 'Job runner error!' . PHP_EOL;
    echo $e->getMessage() . PHP_EOL;
}
