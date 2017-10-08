<?php
date_default_timezone_set('Asia/Novosibirsk');

// Command that starts the built-in web server
$command = sprintf(
    'OVERRIDE_CONFIG_PATH=%s php -S %s:%d -t %s >/dev/null 2>&1 & echo $!',
    __DIR__ . '/util/config.php',
    WEB_SERVER_HOST,
    WEB_SERVER_PORT,
    WEB_SERVER_DOCROOT
);

echo "Run: " . $command;
// Execute the command and store the process ID
$output = array();
exec($command, $output);
$pid = (int)$output[0];

echo sprintf(
    '%s - Web server started on %s:%d with PID %d',
    date('r'),
    WEB_SERVER_HOST,
    WEB_SERVER_PORT,
    $pid
) . PHP_EOL;

$testconf = require(__DIR__ . '/util/config.php');
echo "\033[34mServer-side errors and exceptions are printed to " . realpath($testconf['verboseLog'])
    . " - check it out in case of any misunderstandings! Also you may use trigger_error to get some "
    . "debug output from server side\033[0m" . PHP_EOL;

// Kill the web server when the process ends
register_shutdown_function(
    function () use ($pid) {
        echo sprintf('%s - Killing process with ID %d', date('r'), $pid) . PHP_EOL;
        exec('kill ' . $pid);
    }
);

putenv("OVERRIDE_CONFIG_PATH=" . __DIR__ . '/util/config.php'); // for units

require_once __DIR__ . '/../vendor/autoload.php';
