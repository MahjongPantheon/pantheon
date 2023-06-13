<?php

// Local server deployment settings
$locals = [];
if (file_exists(__DIR__ . '/local/index.php')) {
    $locals = require __DIR__ . '/local/index.php';
} else {
    trigger_error(
        'Notice: using default config & DB settings. '
        . 'It\'s fine on developer machine, but wrong on prod server. '
        . 'You might want to create config/local/* files with production settings.'
    );
}

return array_merge([
    // ---------- may be overridden in local settings -----------
    'db'        => require __DIR__ . '/db.php',
    'verbose'   => true, // TODO: change this in your local config!
    'verboseLog' => null,
    'serverDefaultTimezone' => 'UTC'
], $locals);
