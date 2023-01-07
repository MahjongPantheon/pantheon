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

require_once __DIR__ . '/helpers/Url.php';
require_once __DIR__ . '/helpers/Config.php';
require_once __DIR__ . '/HttpClient.php';
require_once __DIR__ . '/FreyClient.php';
require_once __DIR__ . '/MimirClient.php';
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
     * @var MimirClient
     */
    protected $_mimir;

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
     * @var int|null
     */
    protected $_mainEventId;

    /**
     * @var array
     */
    protected $_eventIdList = [];

    /**
     * @var string
     */
    protected $_mainTemplate = '';

    /**
     * @var int|null
     */
    protected $_currentPersonId;

    /**
     * @var string|null
     */
    protected $_authToken;

    /**
     * @var array
     */
    protected $_accessRules = [];

    /**
     * TODO: this is temporary lightweight hack; should be replaced with full-sized ACL in future.
     * @var bool
     */
    protected $_eventadmin = false;

    /**
     * @var bool
     */
    protected $_superadmin = false;

    /**
     * [ 'id' => int,
     *   'city' => string,
     *   'email' => string | null,
     *   'phone' => string | null,
     *   'tenhou_id' => string,
     *   'groups' => int[],
     *   'title' => string
     * ]
     * @var array
     */
    protected $_personalData;

    /**
     * @var FreyClient
     */
    protected $_frey;

    /**
     * @var bool
     */
    protected $_useTranslit = false;

    /**
     * Controller constructor.
     * @param string $url
     * @param string[] $path
     * @throws \Exception
     */
    public function __construct($url, $path)
    {
        $this->_url = $url;
        $this->_path = $path;
        $this->_mimir = new \Rheda\MimirClient(Sysconf::API_URL()); // @phpstan-ignore-line
        $this->_frey = new \Rheda\FreyClient(Sysconf::AUTH_API_URL()); // @phpstan-ignore-line

        // i18n support
        // first step is getting browser language
        $locale = \locale_accept_from_http($_SERVER['HTTP_ACCEPT_LANGUAGE']);

        // second step is checking cookie
        if (isset($_COOKIE[Sysconf::COOKIE_LANG_KEY])) {
            $locale = $_COOKIE[Sysconf::COOKIE_LANG_KEY];
        }

        // third step is checking GET attribute
        if (isset($_GET['l'])) {
            $locale = $_GET['l'];
            setcookie(Sysconf::COOKIE_LANG_KEY, $locale, 0, '/');
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

        $this->_currentPersonId = (empty($_COOKIE[Sysconf::COOKIE_ID_KEY]) ? null : intval($_COOKIE[Sysconf::COOKIE_ID_KEY]));
        $this->_authToken = (empty($_COOKIE[Sysconf::COOKIE_TOKEN_KEY]) ? null : $_COOKIE[Sysconf::COOKIE_TOKEN_KEY]);

        $eidMatches = [];
        if (empty($path['event']) || !preg_match('#eid(?<ids>\d+(?:\.\d+)*)#is', $path['event'], $eidMatches)) {
            $this->_mainEventId = null;
        } else {
            $ids = explode('.', $eidMatches[1]);
            $this->_eventIdList = array_map('intval', $ids);
            $this->_mainEventId = $this->_eventIdList[0];
        }

        if (!empty($this->_currentPersonId)) {
            $authorized = false;
            try {
                $authorized = $this->_frey->quickAuthorize($this->_currentPersonId, $this->_authToken);
            } catch (\Exception $e) {
            } // keep false on exception

            if (!$authorized) {
                $this->_currentPersonId = null;
                $this->_authToken = null;
            } else {
                $this->_frey->getClient()->getHttpClient()->withHeaders([
                    'X-Auth-Token: ' . $this->_authToken,
                    'X-Locale: ' . $locale,
                    'X-Current-Event-Id: ' . $this->_mainEventId,
                    'X-Current-Person-Id: ' . $this->_currentPersonId,
                    'X-Internal-Query-Secret: ' . Sysconf::FREY_INTERNAL_QUERY_SECRET
                ]);

                if (!empty($this->_mainEventId)) {
                    // TODO: access rules for aggregated events?
                    $this->_accessRules = $this->_frey->getAccessRules($this->_currentPersonId, $this->_mainEventId);
                    if ($this->_accessRules[FreyClient::PRIV_IS_SUPER_ADMIN]) {
                        $this->_superadmin = true;
                    }
                    if ($this->_accessRules[FreyClient::PRIV_ADMIN_EVENT]) {
                        $this->_eventadmin = true;
                    }
                } else if (!empty($this->_currentPersonId)) {
                    $this->_superadmin = $this->_frey->getSuperadminFlag($this->_currentPersonId);
                }

                $this->_personalData = $this->_frey->getPersonalInfo([$this->_currentPersonId])[0];
            }
        }

        /** @var HttpClient $client */
        $client = $this->_mimir->getClient()->getHttpClient();

        $client->withHeaders([
            'X-Debug-Token: ' . Sysconf::DEBUG_TOKEN(),
            'X-Auth-Token: ' . $this->_authToken,
            'X-Current-Event-Id: ' . $this->_mainEventId,
            'X-Current-Person-Id: ' . $this->_currentPersonId,
            'X-Internal-Query-Secret: ' . Sysconf::MIMIR_INTERNAL_QUERY_SECRET,
            'X-Locale: ' . $locale,
            // @phpstan-ignore-next-line
            'X-Api-Version: ' . Sysconf::API_VERSION_MAJOR . '.' . Sysconf::API_VERSION_MINOR
        ]);

        // @phpstan-ignore-next-line
        if (Sysconf::DEBUG_MODE) {
            $client->withDebug();
            $client->withCookies(['XDEBUG_SESSION=PHPSTORM']);
            $this->_frey->getClient()->getHttpClient()->withDebug();
            $this->_frey->getClient()->getHttpClient()->withCookies(['XDEBUG_SESSION=PHPSTORM']);
        }

        $this->_rulesList = [];

        foreach ($this->_eventIdList as $eventId) {
            $gameConfig = Config::fromRaw($this->_mimir->getGameConfig($eventId));
            $this->_rulesList[$eventId] = $gameConfig;
        }

        if (!empty($this->_mainEventId)) {
            $this->_mainEventRules = $this->_rulesList[$this->_mainEventId];
        } else {
            $this->_mainEventRules = Config::fromRaw(Config::$_blankRules);
        }

        $this->_checkCompatibility($client->getLastHeaders());
    }

    /**
     * @return void
     */
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

            $templateEngine = Templater::getInstance($this->_eventIdList);

            header("Content-type: text/html; charset=utf-8");

            if (count($this->_eventIdList) > 1) {
                /* Aggregated events. */
                echo $templateEngine->render('Layout', [
                    'eventTitle' => _t("Aggregated event"),
                    'pageTitle' => $pageTitle,
                    'currentPerson' => $this->_personalData,
                    'content' => $templateEngine->render($this->_mainTemplate, $context),
                    'userHasAdminRights' => $this->_userHasAdminRights(),
                    'isAggregated' => true,
                    'isLoggedIn' => !empty($this->_personalData)
                ]);
            } else {
                /* Simple events. */
                echo $templateEngine->render('Layout', [
                    'tyrUrl' => Sysconf::MOBILE_CLIENT_URL(),
                    'isOnline' => $this->_mainEventRules->isOnline(),
                    'isTeam' => $this->_mainEventRules->isTeam(),
                    'useTimer' => $this->_mainEventRules->useTimer(),
                    'isTournament' => !$this->_mainEventRules->allowPlayerAppend(),
                    'usePenalty' => $this->_mainEventRules->usePenalty(),
                    'syncStart' => $this->_mainEventRules->syncStart(),
                    'eventTitle' => $this->_mainEventRules->eventTitle(),
                    'isPrescripted' => $this->_mainEventRules->isPrescripted(),
                    'userHasAdminRights' => $this->_userHasAdminRights(),
                    'pageTitle' => $pageTitle,
                    'content' => $templateEngine->render($this->_mainTemplate, $context),
                    'eventSelected' => $this->_mainEventId,
                    'currentPerson' => $this->_personalData,
                    'hideAddReplayButton' => $this->_mainEventRules->hideAddReplayButton(),
                    'isLoggedIn' => !empty($this->_personalData),
                    'isSuperadmin' => $this->_superadmin,
                ]);
            }
        }

        $this->_afterRun();
    }

    /**
     * @param string[] $data
     * @return string[]
     */
    protected function _transliterate(array $data)
    {
        if (empty($data)) {
            return $data;
        }

        if ($this->_useTranslit) {
            $tr = \Transliterator::create('Cyrillic-Latin; Latin-ASCII');
            if (!empty($tr)) {
                array_walk_recursive($data, function (&$val, $index) use ($tr) {
                    $val = $tr->transliterate($val);
                });
            }
        }
        return $data;
    }

    /**
     * @return array Mustache context for render
     */
    abstract protected function _run();

    /**
     * @return string current page title
     */
    abstract protected function _pageTitle();

    /**
     * @return bool
     */
    protected function _beforeRun()
    {
        // To be overridden in child classes.
        // Return true from here to execute run() and display page.
        // Return false from here to prevent all other actions (useful for redirects and so on)
        return true;
    }

    protected function _afterRun(): void
    {
    }

    /**
     * @param string $url
     * @return Controller
     * @throws \Exception
     */
    public static function makeInstance(string $url)
    {
        $routes = require_once __DIR__ . '/../config/routes.php';
        self::_healthSpecialPath($url);

        $matches = [];
        /** @var ?Controller $controllerInstance */
        $controllerInstance = null;
        $path = (string)parse_url($url, PHP_URL_PATH);
        foreach ($routes as $regex => $controller) {
            if (!empty($regex) && $regex[0] == '!') {
                // Eventless paths handling
                $re = '#^' . substr($regex, 1) . '/?$#';
            } else {
                $re = '#^/(?<event>eid\d+(?:\.\d+)*)' . $regex . '/?$#';
            }

            if (preg_match($re, $path, $matches)) {
                require_once __DIR__ . "/controllers/{$controller}.php";
                $wNs = '\\Rheda\\' . $controller;
                $controllerInstance = new $wNs($url, $matches);
                break;
            }
        }

        if ($path == '/' || empty($path)) { // Multievent mainpage controller (Rheda home page)
            $controller = $routes['!']; // Special path handling
            require_once __DIR__ . "/controllers/{$controller}.php";
            $wNs = '\\Rheda\\' . $controller;
            $controllerInstance = new $wNs($url, $matches);
        }

        if (!$controllerInstance) {
            throw new \Exception('No available controller found for URL: ' . $url);
        }

        // We know for sure that it's controller instance, but phpstan doesn't :(
        // @phpstan-ignore-next-line
        return $controllerInstance;
    }

    /**
     * @param string $url
     * @return void
     */
    protected static function _healthSpecialPath($url)
    {
        if ($url === '/health') {
            $changedLines = [];
            exec('cd ../../ && git diff --color | bash Rheda/bin/ansi2html.sh', $changedLines);

            $status = [];
            exec('cd ../../ && git status', $status);

            $commit = exec('cd ../../ && git rev-parse HEAD');
            $changed = implode("\n", $changedLines);
            $status = implode("\n", $status);

            $ret = <<<DATA
<h4>Current commit: {$commit}</h4>
<hr />
<div>Customized files:</div>
<pre>
  {$status}
</pre>

<hr />
<div>Changes:</div>
{$changed}
DATA;
            echo $ret;
            exit();
        }
    }

    /**
     * @return bool
     */
    protected function _userHasAdminRights()
    {
        if (count($this->_eventIdList) > 1) {
            return false; // No admins in aggregated events
        }

        if (empty($this->_mainEventId) || empty($this->_currentPersonId)) {
            return false;
        }

        if ($this->_superadmin || $this->_eventadmin) {
            return true;
        }

        return false;
    }

    /**
     * @return void
     */
    protected function _checkCompatibility(array $headersArray)
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

        // @phpstan-ignore-next-line
        if (intval($major) !== Sysconf::API_VERSION_MAJOR) {
            throw new \Exception('API major version mismatch. Update your app or API instance!');
        }

        // @phpstan-ignore-next-line
        if (intval($minor) > Sysconf::API_VERSION_MINOR && Sysconf::DEBUG_MODE) {
            trigger_error('API minor version mismatch. Consider updating if possible', E_USER_WARNING);
        }
    }

    /**
     * @param int $perpage
     * @return int
     */
    protected function _offset($perpage)
    {
        return (intval($this->_path['page'] ?? 1) - 1) * $perpage;
    }

    /**
     * Usage in controller:
     * return [ ...other data..., ...$this->_generatePaginationData(...) ];
     *
     * @param int $currentPage
     * @param int $totalPages
     * @param string $baseUrl should have trailing slash!
     * @param int $range
     * @param boolean $fromRoot
     * @return array
     */
    protected function _generatePaginationData($currentPage, $totalPages, $baseUrl, $range = 3, $fromRoot = false)
    {
        $idList =  implode('.', $this->_eventIdList);
        $pageNumbers = [$currentPage];
        for ($i = 1; $i < $range; $i++) {
            $pageNumbers = [$currentPage - $i, ...$pageNumbers, $currentPage + $i];
        }
        $pageNumbers = array_values(array_filter($pageNumbers, function ($el) use ($totalPages, $currentPage) {
            return $el === $currentPage || ($el > 0 && $el <= $totalPages);
        }));

        return [
            '__firstPageActive' => $currentPage == 1,
            '__hrefFirst' => $fromRoot
                ? $baseUrl . 'page/1'
                : Url::make($baseUrl . 'page/1', $idList),
            '__hrefPrevious' => $fromRoot
                ? $baseUrl . 'page/' . ($currentPage - 1)
                : Url::make($baseUrl . 'page/' . ($currentPage - 1), $idList),
            '__pages' => array_map(function ($pageNum) use ($currentPage, $baseUrl, $idList, $fromRoot) {
                return [
                    'active' => $pageNum === $currentPage,
                    'text' => $pageNum,
                    'href' => $fromRoot
                        ? $baseUrl . 'page/' . $pageNum
                        : Url::make($baseUrl . 'page/' . $pageNum, $idList)
                ];
            }, $pageNumbers),
            '__lastPageActive' => $currentPage == $totalPages,
            '__hrefNext' => $fromRoot
                ? $baseUrl . 'page/' . ($currentPage + 1)
                : Url::make($baseUrl . 'page/' . ($currentPage + 1), $idList),
            '__hrefLast' => $fromRoot
                ? $baseUrl . 'page/' . $totalPages
                : Url::make($baseUrl . 'page/' . $totalPages, $idList),
        ];
    }
}
