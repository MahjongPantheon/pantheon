<?php
require_once __DIR__ . '/../vendor/autoload.php';

use GO\Scheduler;

// Create a new scheduler
$scheduler = new Scheduler();

$scheduler->php(__DIR__ . '/runJobs.php', null, [], 'runJobs')
    ->at('* * * * *')
    ->onlyOne()
    ->output(['/tmp/runJobs.cron.log']);

// Let the scheduler execute jobs which are due.
$scheduler->run();
