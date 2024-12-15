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

return [
    // ---------- may be overridden in local settings -----------
    'db'        => require __DIR__ . '/db.php',
    'verbose'   => getenv('VERBOSE') === 'true',
    'huginUrl'  => getenv('HUGIN_URL_INTERNAL'),
    'verboseLog' => null,
    'serverDefaultTimezone' => 'UTC'
];
