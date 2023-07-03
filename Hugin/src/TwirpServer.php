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

use Common\GetLastDayPayload;
use Common\GetLastDayResponse;
use Common\GetLastMonthPayload;
use Common\GetLastMonthResponse;
use Common\GetLastYearPayload;
use Common\GetLastYearResponse;
use Common\Hugin;
use Exception;
use Memcached;
use Monolog\Handler\ErrorLogHandler;
use Monolog\Logger;

require_once __DIR__ . '/helpers/Config.php';
require_once __DIR__ . '/helpers/Db.php';
require_once __DIR__ . '/helpers/ErrorHandler.php';
require_once __DIR__ . '/controllers/Events.php';

/**
 * Thin mediator between new twirp API and existing controllers
 */
final class TwirpServer implements Hugin
{
    protected EventsController $_eventsController;
    protected Db $_db;
    protected Logger $_syslog;
    protected Config $_config;
    protected Memcached $_mc;

    /**
     * @param string|null $configPath
     * @throws Exception
     */
    public function __construct($configPath = '')
    {
        $cfgPath = empty($configPath) ? __DIR__ . '/../config/index.php' : $configPath;
        $this->_config = new Config($cfgPath);
        date_default_timezone_set((string)$this->_config->getValue('serverDefaultTimezone'));
        $this->_db = new Db($this->_config);
        $this->_syslog = new Logger('Hugin');
        $this->_syslog->pushHandler(new ErrorLogHandler());
        $this->_mc = new \Memcached();
        $this->_mc->addServer('127.0.0.1', 11211);

        // + some custom handler for testing errors
        if ($this->_config->getValue('verbose')) {
            (new ErrorHandler($this->_config, $this->_syslog))->register();
        }

        $this->_eventsController = new EventsController($this->_db, $this->_syslog, $this->_config, $this->_mc);
    }

    /**
     * @param array $ctx
     * @param GetLastDayPayload $req
     * @return GetLastDayResponse
     * @throws Exception
     */
    public function GetLastDay(array $ctx, GetLastDayPayload $req): \Common\GetLastDayResponse
    {
        return (new GetLastDayResponse())
            ->setData($this->_eventsController->getLastDay());
    }

    /**
     * @param array $ctx
     * @param GetLastMonthPayload $req
     * @return GetLastMonthResponse
     * @throws Exception
     */
    public function GetLastMonth(array $ctx, GetLastMonthPayload $req): \Common\GetLastMonthResponse
    {
        return (new GetLastMonthResponse())
            ->setData($this->_eventsController->getLastMonth());
    }

    /**
     * @param array $ctx
     * @param GetLastYearPayload $req
     * @return GetLastYearResponse
     * @throws Exception
     */
    public function GetLastYear(array $ctx, GetLastYearPayload $req): \Common\GetLastYearResponse
    {
        return (new GetLastYearResponse())
            ->setData($this->_eventsController->getLastYear());
    }
}
