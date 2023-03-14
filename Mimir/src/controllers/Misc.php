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

use Monolog\Formatter\LineFormatter;
use Monolog\Handler\StreamHandler;
use Monolog\Logger;

require_once __DIR__ . '/../Controller.php';

/**
 * Class MiscController
 * For primitive logging and other misc tasks
 *
 * @package Mimir
 */
class MiscController extends Controller
{
    /**
     * @var Logger
     */
    protected $_frontErrorLogger = null;

    /**
     * @var string
     */
    private $_logPath =  '/var/log/php-fpm/mimir_log_front_errors.log';

    public function createLogger()
    {
        if (!file_exists($this->_logPath)) {
            touch($this->_logPath);
        }
        $handler = new StreamHandler($this->_logPath, Logger::DEBUG, true, null);
        $handler->setFormatter(new LineFormatter());

        $this->_frontErrorLogger = new Logger('Frontend');
        $this->_frontErrorLogger->pushHandler($handler);
    }

    /**
     * @param string $facility
     * @param string $sessionHash
     * @param float $playerId
     * @param string $error
     * @param string $stack
     */
    public function addErrorLog($facility, $sessionHash, $playerId, $error, $stack)
    {
        if ($this->_frontErrorLogger === null) {
            $this->createLogger();
        }
        $this->_frontErrorLogger->addError(
            '[' . $facility . ']' .
                '[' . (empty($sessionHash) ? '-no session-' : $sessionHash) . ']' .
                '[' . (empty($playerId) ? '-no player-' : $playerId) . ']' .
                ' ' . $error,
            explode("\n", $stack)
        );
    }
}
