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
namespace Hugin;

require_once __DIR__ . '/../src/helpers/Config.php';
require_once __DIR__ . '/../src/helpers/Db.php';

if (!empty(getenv('OVERRIDE_CONFIG_PATH'))) {
    $configPath = getenv('OVERRIDE_CONFIG_PATH');
} else {
    $configPath = __DIR__ . '/../config/index.php';
}
$config = new Config($configPath);
$db = new Db($config);

$from = date('Y-m-d 00:00:00', time() - 2 * 24 * 60 * 60);
$db->table('event')->rawQuery(<<<QUERY
    DELETE from sys_errors WHERE created_at < '{$from}'
QUERY)->findOne();

$db->table('event')->rawQuery(<<<QUERY
    VACUUM sys_errors
QUERY)->findOne();

$db->table('event')->rawQuery(<<<QUERY
    VACUUM event
QUERY)->findOne();
