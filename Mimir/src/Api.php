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

require_once __DIR__ . '/../../Common/Storage.php';
require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/DataSource.php';
require_once __DIR__ . '/Db.php';
require_once __DIR__ . '/Meta.php';
require_once __DIR__ . '/ErrorHandler.php';
require_once __DIR__ . '/FreyClient.php';
require_once __DIR__ . '/FreyClientTwirp.php';

use Monolog\Logger;
use Monolog\Handler\ErrorLogHandler;

class Api
{
    /**
     * @var DataSource
     */
    protected $_ds;
    /**
     * @var IDb
     */
    protected $_db;
    /**
     * @var Logger
     */
    protected $_syslog;
    /**
     * @var Meta
     */
    protected $_meta;
    /**
     * @var Config
     */
    protected $_config;
    /**
     * @var IFreyClient
     */
    protected $_frey;
    /**
     * @var \Common\Storage
     */
    protected $_storage;

    /**
     * Api constructor.
     * @param string|null $configPath
     * @throws \Exception
     */
    public function __construct($configPath = null)
    {
        $cfgPath = empty($configPath) ? __DIR__ . '/../config/index.php' : $configPath;
        $this->_config = new Config($cfgPath);
        $this->_storage = new \Common\Storage($this->_config->getStringValue('cookieDomain'));
        $this->_db = new Db($this->_config);
        /** @var string $freyUrl */
        $freyUrl = $this->_config->getStringValue('freyUrl');
        if ($freyUrl === '__mock__') { // testing purposes
            $this->_frey = new FreyClientMock('');
        } else {
            if ($this->_storage->getTwirpEnabled()) {
                $this->_frey = new FreyClientTwirp($freyUrl);
            } else {
                $this->_frey = new FreyClient($freyUrl);
            }
        }
        $this->_ds = new DataSource($this->_db, $this->_frey);
        $this->_meta = new Meta($this->_frey, $this->_storage, $this->_config, $_SERVER);
        $this->_syslog = new Logger('RiichiApi');
        $this->_syslog->pushHandler(new ErrorLogHandler());

        if ($this->_storage->getTwirpEnabled()) {
            // @phpstan-ignore-next-line
            $this->_frey->withHeaders([
                'X-Locale' => $this->_meta->getSelectedLocale()
            ]);
        } else {
            // @phpstan-ignore-next-line
            $this->_frey->getClient()->getHttpClient()->withHeaders([
                'X-Locale: ' . $this->_meta->getSelectedLocale(),
            ]);
        }

        // + some custom handler for testing errors
        if ($this->_config->getBooleanValue('verbose')) {
            (new ErrorHandler($this->_config, $this->_syslog))->register();
        }
    }

    /**
     * @return string
     *
     * @psalm-return string
     */
    public function getDefaultServerTimezone()
    {
        return $this->_config->getStringValue('serverDefaultTimezone');
    }

    public function registerImplAutoloading(): void
    {
        // @phpstan-ignore-next-line
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

    /**
     * @return (mixed|object|string)[][]
     *
     * @psalm-return array<array-key, array{instance: mixed|object, method: string, className: string}>
     */
    public function getMethods(): array
    {
        $runtimeCache = [];
        /** @var string[] $routes */
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
                $ret['instance'] = $runtimeCache[$route[0]] = new $className($this->_ds, $this->_syslog, $this->_config, $this->_meta);
            }

            return $ret;
        }, $routes);
    }

    /**
     * @param string $message
     */
    public function log(string $message): void
    {
        $this->_syslog->info($message);
    }
}
