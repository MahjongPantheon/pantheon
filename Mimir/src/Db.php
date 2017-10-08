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

use \Idiorm\ORM;

require_once __DIR__ . '/../vendor/ctizen/idiorm/src/idiorm.php';
require_once __DIR__ . '/../src/interfaces/IDb.php';
require_once __DIR__ . '/../src/Config.php';

/**
 * Class Db
 * @package Riichi
 *
 * Simple wrapper around IdiORM to encapsulate it's configuration
 */
class Db implements IDb
{
    /**
     * @var int instances counter
     */
    static protected $_ctr = 0;

    protected $_connString;

    public function __construct(Config $cfg)
    {
        self::$_ctr++;
        if (self::$_ctr > 1) {
            trigger_error(
                "Using more than single instance of DB is generally not recommended, " . PHP_EOL .
                "as it uses IdiORM inside, which has static configuration! Current \n" . PHP_EOL .
                "DB settings were applied to all instances - this may be not what you want!",
                E_USER_WARNING
            );
        }

        $this->_connString = $cfg->getDbConnectionString();
        $credentials = $cfg->getDbConnectionCredentials();

        ORM::configure($this->_connString);
        if (!empty($credentials)) {
            ORM::configure($credentials); // should pass username and password
        }
    }

    /**
     * General entry point for all queries
     *
     * @param $tableName
     * @throws \Exception
     * @return \Idiorm\ORM
     */
    public function table($tableName)
    {
        return ORM::forTable($tableName);
    }

    public function debug()
    {
        return [
            'LAST_QUERY' => ORM::getLastStatement()->queryString,
            'ERROR_INFO' => ORM::getLastStatement()->errorInfo()
        ];
    }

    public function lastInsertId()
    {
        ORM::rawExecute('SELECT LASTVAL()');
        return ORM::getLastStatement()->fetchColumn();
    }

    /**
     * Basic upsert.
     * All fields are casted to integer for safer operations.
     * This functionality is used for many-to-many relations,
     * so integer should be enough.
     *
     * This should not be used for external data processing.
     * May have some vulnerabilities on field names escaping.
     *
     * Warning:
     * Don't touch this crap until you totally know what are you doing :)
     *
     * @param $table
     * @param $data [ [ field => value, field2 => value2 ], [ ... ] ] - nested arrays should be monomorphic
     * @param $tableUniqueFields string[] List of columns with unique constraint to check
     * @throws \Exception
     * @return boolean
     */
    public function upsertQuery($table, $data, $tableUniqueFields)
    {
        $data = array_map(function ($dataset) {
            foreach ($dataset as $k => $v) {
                $dataset[$k] = intval($v); // Maybe use PDO::quote here in future
            }
            return $dataset;
        }, $data);

        $fields = array_map(function ($field) {
            return '"' . $field . '"';
        }, array_keys(reset($data)));

        $values = '(' . implode('), (', array_map(function ($dataset) {
            return implode(', ', array_values($dataset));
        }, $data)) . ')';

        $assignments = implode(', ', array_map(function ($field) {
            return $field . '= excluded.' . $field;
        }, $fields));

        $fields = implode(', ', $fields);
        $tableUniqueFields = implode(',', $tableUniqueFields);

        // Postgresql >= 9.5
        return ORM::rawExecute("
            INSERT INTO {$table} ({$fields}) VALUES {$values} 
            ON CONFLICT ({$tableUniqueFields}) DO UPDATE SET {$assignments}
        ");
    }

    // For testing purposes
    static protected $__testingInstance = null;
    public static function __getCleanTestingInstance()
    {
        shell_exec('cd ' . __DIR__ . '/../ && make init_test_db && make clean_test_db');

        if (self::$__testingInstance === null) {
            $cfg = new Config(__DIR__ . '/../tests/util/config.php');
            self::$_ctr = 0;
            self::$__testingInstance = new self($cfg);
        }

        return self::$__testingInstance;
    }
}
