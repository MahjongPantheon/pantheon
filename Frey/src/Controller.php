<?php
/*  Frey: ACL & user data storage
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
namespace Frey;

require_once __DIR__ . '/helpers/i18n.php';

use Monolog\Logger;

abstract class Controller
{
    /**
     * @var Db
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
     * @var Meta
     */
    protected $_meta;

    /**
     * Controller constructor.
     * @param IDb $db
     * @param Logger $log
     * @param Config $config
     * @param Meta $meta
     * @throws \Exception
     */
    public function __construct(IDb $db, Logger $log, Config $config, Meta $meta)
    {
        $this->_db = $db;
        $this->_log = $log;
        $this->_config = $config;
        $this->_meta = $meta;

        $this->_meta->sendVersionHeader(
            $this->_config->getValue('api.version_major'),
            $this->_config->getValue('api.version_minor')
        );

        $locale = 'en_US.UTF-8';

        // i18n support
        // first step is getting browser language
        if (!empty($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
            $locale = \locale_accept_from_http($_SERVER['HTTP_ACCEPT_LANGUAGE']);
        }

        // second step is checking cookie
        if (isset($_COOKIE['language'])) {
            $locale = $_COOKIE['language'];
        }

        // List of locales
        // https://gcc.gnu.org/onlinedocs/libstdc++/manual/localization.html
        switch ($locale) {
            // map common lang ids to more specific
            case 'ru':
            case 'ru_RU':
            case 'ru_UA':
                $locale = 'ru_RU.UTF-8';
                break;
            case 'de':
            case 'de_DE':
            case 'de_AT':
            case 'de_BE':
            case 'de_CH':
            case 'de_LU':
                $locale = 'de_DE.UTF-8';
                break;
            default:
                $locale = 'en_US.UTF-8';
        }

        if (setlocale(LC_ALL, $locale) === false) {
            throw new \Exception("Server error: The $locale locale is not installed");
        }
        putenv('LC_ALL=' . $locale);
    }

    protected function _logStart($method, $args)
    {
        $this->_log->info('[Frey][' . __CLASS__ . '->' . $method . '](' . implode(', ', $args) . ') :: started');
    }

    protected function _logSuccess($method, $args)
    {
        $this->_log->info('[Frey][' . __CLASS__ . '->' . $method . '](' . implode(', ', $args) . ') :: success');
    }

    protected function _logError($method, $args)
    {
        $this->_log->info('[Frey][' . __CLASS__ . '->' . $method . '](' . implode(', ', $args) . ') :: failed');
    }

    protected function _depersonalizeEmail($email)
    {
        $parts = explode('@', $email);
        return implode('@', [
            substr($parts[0], 0, 5)
                . str_repeat('*', max(0, strlen($parts[0]) - 5)),
            str_repeat('*', max(0, strlen($parts[1]) - 6))
                . substr($parts[1], strlen($parts[1]) - 6, 6)
        ]);
    }
}
