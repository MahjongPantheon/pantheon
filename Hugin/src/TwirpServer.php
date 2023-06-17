<?php

namespace Hugin;

use Common\GetLastDayPayload;
use Common\GetLastDayResponse;
use Common\GetLastMonthPayload;
use Common\GetLastMonthResponse;
use Common\GetLastYearPayload;
use Common\GetLastYearResponse;
use Common\Hugin;
use Exception;
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

        // + some custom handler for testing errors
        if ($this->_config->getValue('verbose')) {
            (new ErrorHandler($this->_config, $this->_syslog))->register();
        }

        $this->_eventsController = new EventsController($this->_db, $this->_syslog, $this->_config);
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
