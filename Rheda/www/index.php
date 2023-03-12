<?php
/*  Rheda: visualizer and control panel
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

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/sysconf.php';

// Main entry point
require_once __DIR__ . '/../src/Controller.php';
if ($_SERVER['REQUEST_URI'] == '/favicon.ico') {
    // Kludge ^_^ This should not be handled by php, nginx to the rescue on prod.
    return '';
}

try {
    $controller = \Rheda\Controller::makeInstance($_SERVER['REQUEST_URI']);
    $controller->run();
} catch (\Exception $ex) {
    if ($ex instanceof \Common\TwirpError) {
        trigger_error('Exception for path: ' . $_SERVER['REQUEST_URI'] . PHP_EOL
            . $ex->getTraceAsString()
            . json_encode($ex->getMetaMap(), JSON_PRETTY_PRINT), E_USER_WARNING);
    } else {
        throw $ex;
    }
    echo 'Internal server error';
}
