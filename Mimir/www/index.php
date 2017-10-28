<?php
/*  Mimir: mahjong games storage
 *  Copyright (C) 2016  o.klimenko aka ctizen
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
namespace Riichi;

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../src/Api.php';

use JsonRPC\Server;

$configPath = null;
if (!empty(getenv('OVERRIDE_CONFIG_PATH'))) {
    $configPath = getenv('OVERRIDE_CONFIG_PATH');
}

$server = new Server();
$api = new Api($configPath);
$api->registerImplAutoloading();
date_default_timezone_set($api->getDefaultServerTimezone());

foreach ($api->getMethods() as $proc => $method) {
//    $api->log("Registered proc: $proc ({$method['className']}::{$method['method']})" . PHP_EOL);
    $server
        ->withLocalException('PDOException')
        ->getProcedureHandler()
        ->withClassAndMethod($proc, $method['instance'], $method['method']);
}

echo $server->execute();
