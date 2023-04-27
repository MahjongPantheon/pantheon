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

// Duplicating data here to enable easier local test debugging in IDE
// Should match env values in Dockerfile, otherwise results will differ.
// See also init_test_db and clean_test_db tasks in Makefile.
// See also phinx.yml
$port = getenv('PHINX_DB_FREY_PORT') ?: 5532;
$dbname = getenv('PHINX_DB_FREY_NAME_UNIT') ?: 'frey_unit';
$user = getenv('PHINX_DB_FREY_USER') ?: 'frey';
$pass = getenv('PHINX_DB_FREY_PASS') ?: 'pgpass';
$host = getenv('PHINX_DB_FREY_HOST') ?: 'localhost';

return [
    'db' => [
        'connection_string' => 'pgsql:host=' . $host . ';port=' . $port . ';dbname=' . $dbname,
        'credentials' => [
            'username' => $user,
            'password' => $pass
        ]
    ],
    'admin'     => [
        'debug_token' => '2-839489203hf2893',
        'internalQuerySecret' => '198vdsh904hfbnkjv98whb2iusvd98b29bsdv98svbr9wghj',
    ],
    'verbose'   => true,
    'serverDefaultTimezone' => 'UTC',
    'verboseLog' => __DIR__ . '/../../data/verbose.log',
    'cookieDomain' => 'localhost',
    'trackerUrl' => null,
    'api' => [
        'version_major' => 1,
        'version_minor' => 0
    ],
    'testing_token' => '198vdsh904hfbnkjv98whb2iusvd98b29bsdv98svbr9wghj',
];
