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
namespace Gullveig;

use Memcached;
use Monolog\Logger;

abstract class Controller
{
    /**
     * @var \Monolog\Logger
     */
    protected $_log;

    /**
     * @var Config
     */
    protected $_config;

    /**
     * @var Memcached
     */
    protected $_mc;

    /**
     * Controller constructor.
     * @param Logger $log
     * @param Config $config
     * @throws \Exception
     */
    public function __construct(Logger $log, Config $config, Memcached $mc)
    {
        $this->_log = $log;
        $this->_config = $config;
        $this->_mc = $mc;
    }

    protected function _logStart(string $method, array $args): void
    {
        $this->_log->info('[Gullveig][' . __CLASS__ . '->' . $method . '](' . implode(', ', $args) . ') :: started');
    }

    protected function _logSuccess(string $method, array $args): void
    {
        $this->_log->info('[Gullveig][' . __CLASS__ . '->' . $method . '](' . implode(', ', $args) . ') :: success');
    }

    protected function _logError(string $method, array $args): void
    {
        $this->_log->info('[Gullveig][' . __CLASS__ . '->' . $method . '](' . implode(', ', $args) . ') :: failed');
    }
}
