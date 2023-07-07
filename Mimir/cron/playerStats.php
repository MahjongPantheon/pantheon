<?php
namespace Mimir;

use Common\Storage;

ini_set('display_errors', 'On');
ini_set('memory_limit', '1024M');
require __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/Config.php';
require_once __DIR__ . '/../src/Db.php';
require_once __DIR__ . '/../src/Meta.php';
require_once __DIR__ . '/../src/DataSource.php';
require_once __DIR__ . '/../src/FreyClientTwirp.php';
require_once __DIR__ . '/../src/helpers/PointsCalc.php';
require_once __DIR__ . '/../src/helpers/SessionState.php';
require_once __DIR__ . '/../src/models/PlayerStat.php';
require_once __DIR__ . '/../src/primitives/Session.php';
require_once __DIR__ . '/../src/primitives/SessionResults.php';
require_once __DIR__ . '/../src/primitives/Round.php';
require_once __DIR__ . '/../src/models/Event.php';

$mc = new \Memcached();
$mc->addServer('127.0.0.1', 11211);

define('STAT_SLEEP_INTERVAL', 2);

if (!empty(getenv('OVERRIDE_CONFIG_PATH'))) {
    $configPath = getenv('OVERRIDE_CONFIG_PATH');
} else {
    $configPath = __DIR__ . '/../config/index.php';
}

$running = $mc->get('cron_player_stats_update_running');
if (!empty($running)) {
    echo 'Player stats update already running, skipping call...' . PHP_EOL;
    return;
}

// Should never run more than 20 minutes
$mc->set('cron_player_stats_update_running', true, 20 * 60);

try {
    $config = new Config($configPath);
    $db = new Db($config);
    $freyClient = new FreyClientTwirp($config->getStringValue('freyUrl'));
    $storage = new Storage('');
    $meta = new Meta($freyClient, $storage, $config);
    $ds = new DataSource($db, $freyClient, $mc);

    $rowsToUpdate = $db->table('player_stats')
        ->rawQuery('select event_id, player_id from player_stats WHERE need_recalc = 1')
        ->findArray();

    $model = new PlayerStatModel($ds, $config, $meta);
    foreach ($rowsToUpdate as $item) {
        echo "Updating stats of player {$item['player_id']} in event {$item['event_id']}..." . PHP_EOL;
        try {
            $model->calculateStat([(int)$item['event_id']], (int)$item['player_id']);
        } catch (\Exception $e) {
            echo $e->getMessage() . PHP_EOL;
            echo "Failed to update stats of player {$item['player_id']} in event {$item['event_id']}, skipping..." . PHP_EOL;
            continue;
        }
        sleep(STAT_SLEEP_INTERVAL);
    }
} catch (\Exception $e) {
    echo 'Player stats update error!' . PHP_EOL;
    echo $e->getMessage() . PHP_EOL;
}

$mc->delete('cron_player_stats_update_running');
