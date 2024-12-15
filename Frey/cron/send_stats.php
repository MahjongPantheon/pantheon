<?php

namespace Frey;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/helpers/Config.php';
require_once __DIR__ . '/../src/helpers/Meta.php';
require_once __DIR__ . '/../src/helpers/Db.php';

if (!empty(getenv('OVERRIDE_CONFIG_PATH'))) {
    $configPath = getenv('OVERRIDE_CONFIG_PATH');
} else {
    $configPath = __DIR__ . '/../config/index.php';
}

try {
    $config = new Config($configPath);
    date_default_timezone_set($config->getValue('serverDefaultTimezone') ?: 'UTC');
    $db = new Db($config);

    $registeredUsers = $db->table('session')
        ->rawQuery("SELECT COUNT(*) as cnt from person")
        ->findArray()['cnt'];

    $options = [
        'http' => [
            'method' => 'POST',
            'content' => json_encode([
                ['m' => 'registered_users', 'v' => $registeredUsers , 's' => 'frey'],
            ]),
            'header'=>  "Content-Type: application/json\r\n"
        ]
    ];

    $context  = stream_context_create($options);
    $result = file_get_contents($config->getValue('huginUrl') . '/addMetric', false, $context);
    if ($result !== 'ok') {
        throw new \Exception('Failed to send stats to Hugin!');
    }
} catch (\Exception $e) {
    echo 'Job runner error!' . PHP_EOL;
    echo $e->getMessage() . PHP_EOL;
}
