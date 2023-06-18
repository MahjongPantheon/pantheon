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

use Monolog\Logger;

abstract class Controller
{
    /**
     * @var IDb
     */
    protected $_db;

    /**
     * @var \Monolog\Logger
     */
    protected $_log;

    /**
     * @var Config
     */
    protected $_config;

    /**
     * Controller constructor.
     * @param IDb $db
     * @param Logger $log
     * @param Config $config
     * @throws \Exception
     */
    public function __construct(IDb $db, Logger $log, Config $config)
    {
        $this->_db = $db;
        $this->_log = $log;
        $this->_config = $config;
    }

    protected function _logStart(string $method, array $args): void
    {
        $this->_log->info('[Hugin][' . __CLASS__ . '->' . $method . '](' . implode(', ', $args) . ') :: started');
    }

    protected function _logSuccess(string $method, array $args): void
    {
        $this->_log->info('[Hugin][' . __CLASS__ . '->' . $method . '](' . implode(', ', $args) . ') :: success');
    }

    protected function _logError(string $method, array $args): void
    {
        $this->_log->info('[Hugin][' . __CLASS__ . '->' . $method . '](' . implode(', ', $args) . ') :: failed');
    }
}
