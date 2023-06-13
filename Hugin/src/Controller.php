<?php
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
