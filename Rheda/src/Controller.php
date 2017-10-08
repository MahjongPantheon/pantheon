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
namespace Riichi;

require_once __DIR__ . '/helpers/MobileDetect.php';
require_once __DIR__ . '/helpers/Url.php';
require_once __DIR__ . '/helpers/Config.php';
require_once __DIR__ . '/helpers/HttpClient.php';
use Handlebars\Handlebars;

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
     * @var Config
     */
    protected $_rules;

    /**
     * @var int
     */
    protected $_eventId;

    /**
     * @var string
     */
    protected $_mainTemplate = '';

    public function __construct($url, $path)
    {
        $this->_url = $url;
        $this->_path = $path;
        $this->_api = new \JsonRPC\Client(Sysconf::API_URL(), false, new HttpClient(Sysconf::API_URL()));

        $eidMatches = [];
        if (empty($path['event']) || !preg_match('#eid(\d+)#is', $path['event'], $eidMatches)) {
            // TODO: убрать чтобы показать страницу со списком событий
            //throw new Exception('No event id found! Use single-event mode, or choose proper event on main page');
            exit('Please select some event!');
        }
        $this->_eventId = intval($eidMatches[1]);

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

        $this->_rules = Config::fromRaw($this->_api->execute('getGameConfig', [$this->_eventId]));
        $this->_checkCompatibility($client->getLastHeaders());
    }

    public function run()
    {
        if (empty($this->_rules->rulesetTitle())) {
            echo '<h2>Oops.</h2>Failed to get event configuration!';
            return;
        }

        if ($this->_beforeRun()) {
            $context = $this->_run();
            $pageTitle = $this->_pageTitle(); // должно быть после run! чтобы могло использовать полученные данные
            $detector = new MobileDetect();

            $m = new Handlebars([
                'loader' => new \Handlebars\Loader\FilesystemLoader(__DIR__ . '/templates/'),
                'partials_loader' => new \Handlebars\Loader\FilesystemLoader(
                    __DIR__ . '/templates/',
                    ['prefix' => '_']
                )
            ]);
            $inlineRenderer = new Handlebars(); // for block nesting

            $m->addHelper("a", function ($template, $context, $args, $source) use ($inlineRenderer) {
                $a = $args->getNamedArguments();
                return '<a href="' . Url::make(Url::interpolate($a['href'], $context), $this->_eventId) . '"'
                    . (empty($a['target']) ? '' : ' target="' . $a['target'] . '"')
                    . (empty($a['class']) ? '' : ' class="' . $a['class'] . '"')
                    . (empty($a['onclick']) ? '' : ' onclick="' . Url::interpolate($a['onclick'], $context) . '"')
                    . '>' . $inlineRenderer->render($source, $context) . '</a>';
            });
            $m->addHelper("form", function ($template, $context, $args, $source) use ($inlineRenderer) {
                $form = $args->getNamedArguments();
                return '<form action="' . Url::make(Url::interpolate($form['action'], $context), $this->_eventId)
                . (empty($form['method']) ? ' method="get"' : '" method="' . $form['method'] . '"')
                . '>' . $inlineRenderer->render($source, $context) . '</form>';
            });

            header("Content-type: text/html; charset=utf-8");

            $add = ($detector->isMobile() && !$detector->isTablet()) ? 'Mobile' : ''; // use full version for tablets

            echo $m->render($add . 'Layout', [
                'isOnline' => $this->_rules->isOnline(),
                'useTimer' => $this->_rules->useTimer(),
                'usePenalty' => $this->_rules->usePenalty(),
                'syncStart' => $this->_rules->syncStart(),
                'eventTitle' => $this->_rules->eventTitle(),
                'pageTitle' => $pageTitle,
                'content' => $m->render($add . $this->_mainTemplate, $context),
                'isLoggedIn' => $this->_adminAuthOk()
            ]);
        }

        $this->_afterRun();
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
     * @throws Exception
     */
    public static function makeInstance($url)
    {
        $routes = require_once __DIR__ . '/../config/routes.php';
        $controller = Sysconf::SINGLE_MODE
            ? self::_singleEventMode($url, $routes)
            : self::_multiEventMode($url, $routes);

        if (!$controller) {
            throw new Exception('No available controller found for this URL');
        }

        return $controller;
    }

    protected static function _singleEventMode($url, $routes)
    {
        $matches = [];
        foreach ($routes as $regex => $controller) {
            $re = '#^' . preg_replace('#^!#is', '', $regex) . '/?$#';
            if (preg_match($re, $url, $matches)) {
                require_once __DIR__ . "/controllers/{$controller}.php";
                $matches['event'] = 'eid' . Sysconf::OVERRIDE_EVENT_ID;
                $wNs = '\\Riichi\\' . $controller;
                return new $wNs($url, $matches);
            }
        }

        return null;
    }

    protected static function _multiEventMode($url, $routes)
    {
        $matches = [];
        foreach ($routes as $regex => $controller) {
            if (Sysconf::SINGLE_MODE) {
                $re = '#^' . mb_substr($regex, 1) . '/?$#';
            } else {
                $re = '#^/(?<event>eid\d+)' . $regex . '/?$#';
            }

            if (preg_match($re, $url, $matches)) {
                require_once __DIR__ . "/controllers/{$controller}.php";
                $wNs = '\\Riichi\\' . $controller;
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
            if (Sysconf::DEBUG_MODE && $_COOKIE['secret'] == 'debug_mode_cookie') {
                return true;
            }

            return !empty($_COOKIE['secret'])
                && !empty(Sysconf::ADMIN_AUTH()[$this->_eventId]['cookie'])
                && $_COOKIE['secret'] == Sysconf::ADMIN_AUTH()[$this->_eventId]['cookie'];
        }
    }

    protected function _getAdminCookie($password)
    {
        if (Sysconf::SINGLE_MODE) {
            if ($password == Sysconf::SUPER_ADMIN_PASS) {
                return Sysconf::SUPER_ADMIN_COOKIE;
            }
        } else {
            // Special password policy for debug mode
            if (Sysconf::DEBUG_MODE && $password == 'password') {
                return 'debug_mode_cookie';
            }

            if (!empty(Sysconf::ADMIN_AUTH()[$this->_eventId]['password'])
                && $password == Sysconf::ADMIN_AUTH()[$this->_eventId]['password']
            ) {
                return Sysconf::ADMIN_AUTH()[$this->_eventId]['cookie'];
            }
        }

        return false;
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
            throw new Exception('API major version mismatch. Update your app or API instance!');
        }

        if (intval($minor) > Sysconf::API_VERSION_MINOR && Sysconf::DEBUG_MODE) {
            trigger_error('API minor version mismatch. Consider updating if possible', E_USER_WARNING);
        }
    }
}
