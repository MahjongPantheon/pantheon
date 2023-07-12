<?php
/*  Hugin: system statistics
 *  Copyright (C) 2023  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
use Monolog\Handler\ErrorLogHandler;
use Monolog\Logger;

require __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/helpers/Config.php';
require_once __DIR__ . '/../src/controllers/Avatars.php';

$cfgPath = empty($configPath) ? __DIR__ . '/../config/index.php' : $configPath;
$config = new \Gullveig\Config($cfgPath);
$mc = new Memcached();
$mc->addServer('127.0.0.1', 11211);
$log = new Logger('Gullveig');
$log->pushHandler(new ErrorLogHandler());
$controller = new \Gullveig\AvatarsController($log, $config, $mc);
$controller->upload(file_get_contents('php://input') ?: '');
