<?php

namespace Mimir;

use Common\Storage;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/Config.php';
require_once __DIR__ . '/../src/FreyClientTwirp.php';
require_once __DIR__ . '/../src/Meta.php';
require_once __DIR__ . '/../src/Db.php';
require_once __DIR__ . '/../src/DataSource.php';
require_once __DIR__ . '/../src/primitives/JobsQueue.php';
require_once __DIR__ . '/jobs/achievements.php';
require_once __DIR__ . '/jobs/playerStats.php';

if (!empty(getenv('OVERRIDE_CONFIG_PATH'))) {
    $configPath = getenv('OVERRIDE_CONFIG_PATH');
} else {
    $configPath = __DIR__ . '/../config/index.php';
}

try {
    $config = new Config($configPath);
    date_default_timezone_set($config->getStringValue('serverDefaultTimezone') ?: 'UTC');
    $db = new Db($config);
    $freyClient = new FreyClientTwirp($config->getStringValue('freyUrl'));
    $mc = new \Memcached();
    $mc->addServer('127.0.0.1', 11211);
    $ds = new DataSource($db, $freyClient, $mc);
    $storage = new Storage('');
    $meta = new Meta($freyClient, $storage, $config);

    // any big number as limit; duplicate job runners should be prevented by scheduler
    $jobs = JobsQueuePrimitive::getPendingJobs($ds, 5000);
    // save names/args to list to prevent job duplication during single run
    $uniqList = [];
    foreach ($jobs as $job) {
        if (!empty($uniqList[$job->getJobName() . '__' . json_encode($job->getJobArguments())])) {
            continue;
        }
        $uniqList[$job->getJobName() . '__' . json_encode($job->getJobArguments())] = true;
        try {
            switch ($job->getJobName()) {
                case JobsQueuePrimitive::JOB_ACHIEVEMENTS:
                    runAchievements($ds, (int)$job->getJobArguments()['eventId']);
                    break;
                case JobsQueuePrimitive::JOB_PLAYER_STATS:
                    runPlayerStats($ds, $config, $meta, (int)$job->getJobArguments()['playerId'], (int)$job->getJobArguments()['eventId']);
                    break;
                default:;
            }
        } catch (\Exception $e) {
            echo 'Job run failed!' . PHP_EOL;
            echo $e->getMessage() . PHP_EOL;
        }
    }
} catch (\Exception $e) {
    echo 'Job runner error!' . PHP_EOL;
    echo $e->getMessage() . PHP_EOL;
}
