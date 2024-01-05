<?php
require_once __DIR__ . '/../vendor/autoload.php';

use GO\Scheduler;

// Create a new scheduler
$scheduler = new Scheduler();

$scheduler->php(__DIR__ . '/jobs/achievements.php', null, [], 'achievements')
    ->at('*/5 * * * *')
    ->onlyOne()
    ->output(['/tmp/achievements.cron.log']);

$scheduler->php(__DIR__ . '/jobs/playerStats.php', null, [], 'playerStats')
    ->at('* * * * *')
    ->onlyOne()
    ->output(['/tmp/playerStats.cron.log']);

// Let the scheduler execute jobs which are due.
$scheduler->run();
