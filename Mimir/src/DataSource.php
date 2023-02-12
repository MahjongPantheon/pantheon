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
namespace Mimir;

require_once __DIR__ . '/../src/interfaces/IDb.php';
require_once __DIR__ . '/../src/interfaces/IFreyClient.php';
require_once __DIR__ . '/../tests/util/FreyClientMock.php';
require_once __DIR__ . '/../src/Config.php';

/**
 * Class DataSource
 * @package Mimir
 *
 * Simple wrapper around Db and Remote data sources
 */
class DataSource
{
    /**
     * @var IDb
     */
    protected $_db;
    /**
     * @var IFreyClient
     */
    protected $_freyClient;

    public function __construct(IDb $db, IFreyClient $freyClient)
    {
        $this->_db = $db;
        $this->_freyClient = $freyClient;
    }

    /**
     * @return IFreyClient
     */
    public function remote()
    {
        return $this->_freyClient;
    }

    public function local(): IDb
    {
        return $this->_db;
    }

    /**
     * Shortcut for ->local()->table()
     *
     * @param string $tableName
     * @throws \Exception
     * @return \Idiorm\ORM
     */
    public function table(string $tableName)
    {
        return $this->_db->table($tableName);
    }

    /**
     * @return DataSource
     */
    public static function __getCleanTestingInstance()
    {
        $db = Db::__getCleanTestingInstance();
        $client = new FreyClientMock('');
        return new self($db, $client);
    }
}
