<?php
/*  Frey: ACL & user data storage
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
        'debug_token' => getenv('DEBUG_TOKEN'),
        'internalQuerySecret' => getenv('INTERNAL_QUERY_SECRET')
    ],
    'db'        => require __DIR__ . '/db.php',
    'verbose'   => getenv('VERBOSE') === 'true',
    'verboseLog' => null,
    'serverDefaultTimezone' => 'UTC',
    'mailer' => [
        'mode' => 'remote_api', // 'local_mta' or 'remote_api'
        'remote_url' => 'http://hermod', // if mode set to 'remote_api', this should point to API address
        'remote_action_key' => getenv('MAIL_ACTION_KEY') ?: 'CHANGE_ME', // if mode set to 'remote_api', this should point to API auth token
        'mailer_addr' => 'noreply@' . getenv('ALLOWED_SENDER_DOMAINS') ?: 'riichimahjong.org', // address of mailer
        'gui_url' => getenv('FORSETI_URL') // target host handling emailed links
    ],
    'cookieDomain' => getenv('COOKIE_DOMAIN'),
    'trackerUrl' => getenv('TRACKER_URL') ?: null,

    // ---------- not intended for local override! ------------
    'api' => [
        'version_major' => 1, // do not change this! Update your setup if version mismatches.
        'version_minor' => 0
    ],
    'testing_token' => ''
];
