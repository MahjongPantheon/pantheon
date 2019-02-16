<?php
/*  Rheda: visualizer and control panel
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
namespace Rheda;

require_once __DIR__ . '/helpers/MobileDetect.php';
require_once __DIR__ . '/helpers/Url.php';
require_once __DIR__ . '/helpers/Config.php';
require_once __DIR__ . '/helpers/HttpClient.php';
require_once __DIR__ . '/helpers/i18n.php';
require_once __DIR__ . '/Templater.php';

abstract class Controller
{
    /**
     * request_uri
     * @var string
     */
    protected $_url;
    /**
     * Parsed slugs list
     * @var string[]
     */
    protected $_path;

    /**
     * @var \JsonRPC\Client
     */
    protected $_api;

    /**
     * Main event rules. For aggregated events, these are the rules of the main event.
     * For simple events, these are the rules of the only used event.
     * @var Config
     */
    protected $_mainEventRules;

    /**
     * Rules of each event from eventIdList.
     * @var Config[]
     */
    protected $_rulesList;

    /**
     * Main event id. For aggregated events, this is the id of the first event in list.
     * For simple events, this is the id of the only used event.
     * @var int
     */
    protected $_mainEventId;

    /**
     * @var array
     */
    protected $_eventIdList;

    /**
     * @var string
     */
    protected $_mainTemplate = '';

    protected $_useTranslit = false;

    public function __construct($url, $path)
    {
        $this->_url = $url;
        $this->_path = $path;
        $this->_api = new \JsonRPC\Client(Sysconf::API_URL(), false, new HttpClient(Sysconf::API_URL()));

        // i18n support
        // first step is getting browser language
        $locale = \locale_accept_from_http($_SERVER['HTTP_ACCEPT_LANGUAGE']);

        // second step is checking cookie
        if (isset($_COOKIE['language'])) {
            $locale = $_COOKIE['language'];
        }

        // third step is checking GET attribute
        if (isset($_GET['l'])) {
            $locale = $_GET['l'];
            setcookie('language', $locale, null, '/');
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
                $this->_useTranslit = true;
                break;
            default:
                $locale = 'en_US.UTF-8';
                $this->_useTranslit = true;
        }

        if (setlocale(LC_ALL, $locale) === false) {
            throw new \Exception("Server error: The $locale locale is not installed");
        }
        putenv('LC_ALL=' . $locale);

        $eidMatches = [];
        if (empty($path['event']) || !preg_match('#eid(?<ids>\d+(?:\.\d+)*)#is', $path['event'], $eidMatches)) {
            // TODO: убрать чтобы показать страницу со списком событий
            //throw new Exception('No event id found! Use single-event mode, or choose proper event on main page');
            exit(_t('Please select some event!'));
        }

        $ids = explode('.', $eidMatches[1]);

        $this->_eventIdList = array_map('intval', $ids);
        $this->_mainEventId = $this->_eventIdList[0];

        /** @var HttpClient $client */
        $client = $this->_api->getHttpClient();

        $client->withHeaders([
            'X-Debug-Token: aehbntyrey',
            'X-Auth-Token: ' . Sysconf::API_ADMIN_TOKEN,
            'X-Api-Version: ' . Sysconf::API_VERSION_MAJOR . '.' . Sysconf::API_VERSION_MINOR
        ]);
        if (Sysconf::DEBUG_MODE) {
            $client->withDebug();
        }

        $this->_rulesList = [];

        foreach ($this->_eventIdList as $eventId) {
            $rules = Config::fromRaw($this->_api->execute('getGameConfig', [$eventId]));
            $this->_rulesList[$eventId] = $rules;
        }

        $this->_mainEventRules = $this->_rulesList[$this->_mainEventId];

        $this->_checkCompatibility($client->getLastHeaders());
    }

    public function run()
    {
        if (empty($this->_mainEventRules->rulesetTitle())) {
            echo _t('<h2>Oops.</h2>Failed to get event configuration!');
            return;
        }

        if ($this->_beforeRun()) {
            $context = $this->_run();

            $context = $this->_transliterate($context);

            $pageTitle = $this->_pageTitle(); // должно быть после run! чтобы могло использовать полученные данные
            $detector = new MobileDetect();

            $templateEngine = Templater::getInstance($this->_eventIdList);
            $add = ($detector->isMobile() && !$detector->isTablet()) ? 'Mobile' : ''; // use full version for tablets

            header("Content-type: text/html; charset=utf-8");

            if (count($this->_eventIdList) > 1) {
                /* Aggregated events. */
                echo $templateEngine->render($add . 'Layout', [
                    'eventTitle' => _t("Aggregated event"),
                    'pageTitle' => $pageTitle,
                    'content' => $templateEngine->render($add . $this->_mainTemplate, $context),
                    'isLoggedIn' => $this->_adminAuthOk(),
                    'isAggregated' => true
                ]);
            } else {
                /* Simple events. */
                echo $templateEngine->render($add . 'Layout', [
                    'isOnline' => $this->_mainEventRules->isOnline(),
                    'isTeam' => $this->_mainEventRules->isTeam(),
                    'useTimer' => $this->_mainEventRules->useTimer(),
                    'isTournament' => !$this->_mainEventRules->allowPlayerAppend(),
                    'usePenalty' => $this->_mainEventRules->usePenalty(),
                    'syncStart' => $this->_mainEventRules->syncStart(),
                    'eventTitle' => $this->_mainEventRules->eventTitle(),
                    'isPrescripted' => $this->_mainEventRules->isPrescripted(),
                    'pageTitle' => $pageTitle,
                    'content' => $templateEngine->render($add . $this->_mainTemplate, $context),
                    'isLoggedIn' => $this->_adminAuthOk(),
                    'hideAddReplayButton' => $this->_mainEventRules->hideAddReplayButton(),
                ]);
            }
        }

        $this->_afterRun();
    }

    protected function _transliterate($data)
    {
        if ($this->_useTranslit) {
            $tr = \Transliterator::create('Cyrillic-Latin; Latin-ASCII');
            array_walk_recursive($data, function (&$val, $index) use ($tr) {
                $val = $tr->transliterate($val);
            });
        }
        return $data;
    }

    /**
     * @return string Mustache context for render
     */
    abstract protected function _run();

    /**
     * @return string current page title
     */
    abstract protected function _pageTitle();

    protected function _beforeRun()
    {
        return true;
    }

    protected function _afterRun()
    {
    }

    /**
     * @param $url
     * @return Controller
     * @throws \Exception
     */
    public static function makeInstance($url)
    {
        $routes = require_once __DIR__ . '/../config/routes.php';

        $controller = Sysconf::SINGLE_MODE
            ? self::_singleEventMode($url, $routes)
            : self::_multiEventMode($url, $routes);

        if (!$controller) {
            trigger_error('No available controller found for URL: ' . $url);
        }

        return $controller;
    }

    protected static function _singleEventMode($url, $routes)
    {
        $matches = [];
        $path = parse_url($url, PHP_URL_PATH);
        foreach ($routes as $regex => $controller) {
            $re = '#^' . preg_replace('#^!#is', '', $regex) . '/?$#';
            if (preg_match($re, $path, $matches)) {
                require_once __DIR__ . "/controllers/{$controller}.php";
                $matches['event'] = 'eid' . Sysconf::OVERRIDE_EVENT_ID;
                $wNs = '\\Rheda\\' . $controller;
                return new $wNs($url, $matches);
            }
        }

        return null;
    }

    protected static function _multiEventMode($url, $routes)
    {
        $matches = [];
        $path = parse_url($url, PHP_URL_PATH);
        foreach ($routes as $regex => $controller) {
            if (Sysconf::SINGLE_MODE) {
                $re = '#^' . mb_substr($regex, 1) . '/?$#';
            } else {
                $re = '#^/(?<event>eid\d+(?:\.\d+)*)' . $regex . '/?$#';
            }

            if (preg_match($re, $path, $matches)) {
                require_once __DIR__ . "/controllers/{$controller}.php";
                $wNs = '\\Rheda\\' . $controller;
                return new $wNs($url, $matches);
            }
        }

        return null;
    }

    protected function _adminAuthOk()
    {
        if (Sysconf::SINGLE_MODE) {
            return !empty($_COOKIE['secret']) && $_COOKIE['secret'] == Sysconf::SUPER_ADMIN_COOKIE;
        } else {
            // Special password policy for debug mode
            if (Sysconf::DEBUG_MODE && !empty($_COOKIE['secret']) && $_COOKIE['secret'] == 'debug_mode_cookie') {
                return true;
            }

            /* For aggregated events we allow any password of the events it contains. */
            foreach ($this->_eventIdList as $eventId) {
                if (!empty($_COOKIE['secret'])
                        && !empty(Sysconf::ADMIN_AUTH()[$eventId]['cookie'])
                        && $_COOKIE['secret'] == Sysconf::ADMIN_AUTH()[$eventId]['cookie']) {
                    return true;
                }
            }

            return false;
        }
    }

    protected function _getAdminAuth($password)
    {
        if (Sysconf::SINGLE_MODE) {
            if ($password == Sysconf::SUPER_ADMIN_PASS) {
                return ['cookie' => Sysconf::SUPER_ADMIN_COOKIE,
                        'cookie_life' => Sysconf::SUPER_ADMIN_COOKIE_LIFE];
            }
        } else {
            // Special password policy for debug mode
            if (Sysconf::DEBUG_MODE && $password == 'password') {
                return ['cookie' => 'debug_mode_cookie',
                        'cookie_life' => Sysconf::DEBUG_MODE_COOKIE_LIFE];
            }

            foreach ($this->_eventIdList as $eventId) {
                if (!empty(Sysconf::ADMIN_AUTH()[$eventId]['password'])
                    && $password == Sysconf::ADMIN_AUTH()[$eventId]['password']
                ) {
                    return Sysconf::ADMIN_AUTH()[$eventId];
                }
            }
        }

        return null;
    }

    protected function _checkCompatibility($headersArray)
    {
        $header = '';
        foreach ($headersArray as $h) {
            if (strpos($h, 'X-Api-Version') === 0) {
                $header = $h;
                break;
            }
        }

        if (empty($header)) {
            return;
        }

        list ($major, $minor) = explode('.', trim(str_replace('X-Api-Version: ', '', $header)));

        if (intval($major) !== Sysconf::API_VERSION_MAJOR) {
            throw new \Exception('API major version mismatch. Update your app or API instance!');
        }

        if (intval($minor) > Sysconf::API_VERSION_MINOR && Sysconf::DEBUG_MODE) {
            trigger_error('API minor version mismatch. Consider updating if possible', E_USER_WARNING);
        }
    }
}
