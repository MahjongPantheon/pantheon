<?php

if (str_starts_with($_SERVER['REQUEST_URI'], '/v2')) {
    include_once __DIR__ . '/twirp/index.php';
}
