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

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Db.php';

use Monolog\Logger;

class ErrorHandler
{
    /**
     * @var Config
     */
    protected $_config;
    /**
     * @var Logger
     */
    protected $_log;

    public function __construct(Config $config, Logger $log)
    {
        $this->_config = $config;
        $this->_log = $log;
    }

    public function register()
    {
        register_shutdown_function([$this, 'checkForFatal']);
        set_error_handler([$this, 'logError'], (E_ALL | E_STRICT) & ~E_USER_NOTICE);
        set_error_handler([$this, 'logDebugError'], E_USER_NOTICE);
        set_exception_handler([$this, 'logException']);
        ini_set("display_errors", "off");
        error_reporting(E_ALL);
    }

    /**
     * Error handler, passes flow over the exception logger with new ErrorException.
     * @param $num
     * @param $str
     * @param $file
     * @param $line
     * @param null $context
     */
    public function logError($num, $str, $file, $line, $context = null)
    {
        $this->logException(new \ErrorException($str, 0, $num, $file, $line));
    }

    /**
     * Error handler, passes flow over the exception logger with new ErrorException.
     * For debug purposes: does not exit on first error
     * @param $num
     * @param $str
     * @param $file
     * @param $line
     * @param null $context
     */
    public function logDebugError($num, $str, $file, $line, $context = null)
    {
        $this->logException(new \ErrorException($str, 0, $num, $file, $line), false);
    }

    /**
     * Uncaught exception handler.
     * @param \Exception $e
     * @param bool $exitOnError
     */
    public function logException($e, $exitOnError = true)
    {
        $message = "-----------------\n" .
            "Date:\t\t" . date("Y-m-d H:i:s") . "\n" .
            "Type:\t\t" . get_class($e) . "\n" .
            "File:\t\t{$e->getFile()}\n" .
            "Line:\t\t{$e->getLine()}\n" .
            "Message:\t{$e->getMessage()}\n" .
            "Trace:\t\t" . str_replace("\n", "\n\t\t\t", $e->getTraceAsString()) . "\n\n"
        ;
        $this->_log->error($message);
        file_put_contents($this->_config->getValue('verboseLog'), $message . PHP_EOL, FILE_APPEND);
        if ($exitOnError) {
            exit();
        }
    }

    /**
     * Checks for a fatal error, work around for set_error_handler not working on fatal errors.
     */
    public function checkForFatal()
    {
        $error = error_get_last();
        if ($error["type"] == E_ERROR) {
            $this->logError($error["type"], $error["message"], $error["file"], $error["line"]);
        }
    }
}
