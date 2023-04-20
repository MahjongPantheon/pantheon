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

// Local server deployment settings
$locals = [];
if (file_exists(__DIR__ . '/local/index.php')) {
    $locals = require __DIR__ . '/local/index.php';
} else {
    if (getenv('IS_DOCKER', true) != '1') {
        trigger_error(
            'Notice: using default config & DB settings. '
            . 'It\'s fine on developer machine, but wrong on prod server. '
            . 'You might want to create config/local/* files with production settings.'
        );
    }
}

return array_merge([
    // ---------- may be overridden in local settings -----------
    'admin'     => [
        'debug_token' => 'CHANGE_ME', // TODO: change this in your local config!
        'internalQuerySecret' => 'CHANGE_ME_INTERNAL' // TODO: change this in your local config!
    ],
    'db'        => require __DIR__ . '/db.php',
    'verbose'   => true, // TODO: change this in your local config!
    'verboseLog' => null,
    'serverDefaultTimezone' => 'UTC',
    'mailer' => [
        'mode' => 'debug', // 'local_mta' or 'remote_api'
        'remote_url' => '', // if mode set to 'remote_api', this should point to API address
        'remote_action_key' => '', // if mode set to 'remote_api', this should point to API auth token
        'mailer_addr' => 'mailer@localhost.tld', // address of mailer
        'gui_url' => 'http://localhost:4007' // target host handling emailed links
    ],
    'cookieDomain' => '.riichimahjong.org', // TODO: change this in your local config!
    'trackerUrl' => null, // should be string or null, %s is placeholder for game hash token

    // ---------- not intended for local override! ------------
    'api' => [
        'version_major' => 1, // do not change this! Update your setup if version mismatches.
        'version_minor' => 0
    ],
    'testing_token' => ''
], $locals);
