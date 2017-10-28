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
require_once __DIR__ . '/Meta.php';
require_once __DIR__ . '/ErrorHandler.php';

use Monolog\Logger;
use Monolog\Handler\ErrorLogHandler;

class Api
{
    protected $_db;
    protected $_syslog;
    protected $_meta;

    public function __construct($configPath = null)
    {
        $this->_config = new Config(empty($configPath) ? __DIR__ . '/../config/index.php' : $configPath);
        $this->_db = new Db($this->_config);
        $this->_meta = new Meta($_SERVER);
        $this->_syslog = new Logger('RiichiApi');
        $this->_syslog->pushHandler(new ErrorLogHandler());

        // + some custom handler for testing errors
        if ($this->_config->getValue('verbose')) {
            (new ErrorHandler($this->_config, $this->_syslog))->register();
        }
    }

    public function getDefaultServerTimezone()
    {
        return $this->_config->getValue('serverDefaultTimezone');
    }

    public function registerImplAutoloading()
    {
        spl_autoload_register(function ($class) {
            $class = ucfirst(str_replace([__NAMESPACE__ . '\\', 'Controller'], '', $class));
            $classFile = __DIR__ . '/controllers/' . $class . '.php';
            if (is_file($classFile) && !class_exists($class)) {
                include_once $classFile;
            } else {
                $this->_syslog->error('Couldn\'t find module ' . $classFile);
            }
        });
    }

    public function getMethods()
    {
        $runtimeCache = [];
        $routes = $this->_config->getValue('routes');
        return array_map(function ($route) use (&$runtimeCache) {
            // We should instantiate every controller here to enable proper reflection inspection in rpc-server
            $ret = [
                'instance' => null,
                'method' => $route[1],
                'className' => $route[0]
            ];

            if (!empty($runtimeCache[$route[0]])) {
                $ret['instance'] = $runtimeCache[$route[0]];
            } else {
                class_exists($route[0]); // this will ensure class existence
                $className = __NAMESPACE__ . '\\' . $route[0];
                $ret['instance'] = $runtimeCache[$route[0]] = new $className($this->_db, $this->_syslog, $this->_config, $this->_meta);
            }

            return $ret;
        }, $routes);
    }

    public function log($message)
    {
        $this->_syslog->info($message);
    }
}
