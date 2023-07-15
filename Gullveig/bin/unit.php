<?php

require __DIR__ . '/../vendor/autoload.php';

if (!ini_get('date.timezone')) {
    ini_set('date.timezone', 'UTC');
}
PHPUnit\TextUI\Command::main();
