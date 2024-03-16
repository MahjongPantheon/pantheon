<?php
namespace Mimir;

ini_set('display_errors', 'On');
ini_set('memory_limit', '1024M');
require_once __DIR__ . '/../../src/helpers/PointsCalc.php';
require_once __DIR__ . '/../../src/helpers/SessionState.php';
require_once __DIR__ . '/../../src/models/PlayerStat.php';
require_once __DIR__ . '/../../src/primitives/Session.php';
require_once __DIR__ . '/../../src/primitives/SessionResults.php';
require_once __DIR__ . '/../../src/primitives/Round.php';
require_once __DIR__ . '/../../src/models/Event.php';

function runPlayerStats(DataSource $ds, Config $config, Meta $meta, int $playerId, int $eventId)
{
    $model = new PlayerStatModel($ds, $config, $meta);
    echo "Updating stats of player {$playerId} in event {$eventId}..." . PHP_EOL;
    try {
        $model->calculateStat([$eventId], $playerId);
    } catch (\Exception $e) {
        echo $e->getMessage() . PHP_EOL;
        echo "Failed to update stats of player {$playerId} in event {$eventId}, skipping..." . PHP_EOL;
    }
}
