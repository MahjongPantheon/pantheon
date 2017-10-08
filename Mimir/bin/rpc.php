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

require __DIR__ . '/../vendor/autoload.php';
use JsonRPC\Client;

$client = new Client('http://localhost:8000/');
$client->getHttpClient()->withDebug();

list($command, $args) = explode(' ', $argv[1], 2);
$re = '#([a-z0-9_-]+|\[.*?\]|\{.*?\})#is';
if (!preg_match_all($re, $args, $matches)) {
    die("Couldn't parse cli parameters :(");
}

try {
    $client->execute($command, $a = array_map(function ($arg) {
        try {
            return json_decode($arg);
        } catch (Exception $e) {
            return $arg;
        }
    }, $matches[0]));
} catch (Exception $e) {}