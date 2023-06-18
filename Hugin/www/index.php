<?php

use Monolog\Handler\ErrorLogHandler;
use Monolog\Logger;

require __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/helpers/Config.php';
require_once __DIR__ . '/../src/helpers/Db.php';
require_once __DIR__ . '/../src/controllers/Events.php';

$cfgPath = empty($configPath) ? __DIR__ . '/../config/index.php' : $configPath;
$config = new \Hugin\Config($cfgPath);
$db = new \Hugin\Db($config);
$log = new Logger('RiichiApi');
$log->pushHandler(new ErrorLogHandler());
$controller = new \Hugin\EventsController($db, $log, $config);

echo $controller->track(file_get_contents('php://input') ?: '');
