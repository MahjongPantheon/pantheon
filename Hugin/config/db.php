<?php

return [
    'connection_string' => 'pgsql:host=' . getenv('PHINX_DB_HUGIN_HOST') . ';port='
        . getenv('PHINX_DB_HUGIN_PORT', true)
        . ';dbname=' . getenv('PHINX_DB_HUGIN_NAME', true),
    'credentials' => [
        'username' => getenv('PHINX_DB_HUGIN_USER'),
        'password' => getenv('PHINX_DB_HUGIN_PASS')
    ]
];
