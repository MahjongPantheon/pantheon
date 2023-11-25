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

return [
    // ---------- may be overridden in local settings -----------
    'admin'     => [
        'internalQuerySecret' => getenv('INTERNAL_QUERY_SECRET'),
        'debug_token' => getenv('DEBUG_TOKEN'),
    ],
    'external' => [
        'externalQuerySecret' => getenv('EXTERNAL_QUERY_SECRET')
    ],
    'db'        => require __DIR__ . '/db.php',
    'freyUrl'   => 'http://frey',
    'sigrunUrl'  => getenv('SIGRUN_URL'),
    'verbose'   => getenv('VERBOSE') === 'true',
    'verboseLog' => null,
    'cookieDomain' => getenv('COOKIE_DOMAIN'),
    'serverDefaultTimezone' => 'UTC',
    'trackerUrl' => getenv('TRACKER_URL') ?: null,

    // ---------- not intended for local override! ------------
    'api' => [
        'version_major' => '1', // do not change this! Update your setup if version mismatches.
        'version_minor' => '0'
    ]
];
