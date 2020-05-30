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

require_once __DIR__ . '/interfaces/IFreyClient.php';

class Meta
{
    /**
     * @var string|null
     */
    protected $_authToken;
    /**
     * @var integer
     */
    protected $_requestedVersionMajor;
    /**
     * @var integer
     */
    protected $_requestedVersionMinor;
    /**
     * @var integer|null
     */
    protected $_currentEventId;
    /**
     * @var integer|null
     */
    protected $_currentPersonId;
    /**
     * @var string
     */
    protected $_selectedLocale;
    /**
     * @var FreyClient
     */
    protected $_frey;
    /**
     * @var array
     */
    protected $_accessRules;

    /**
     * Meta constructor.
     * @param IFreyClient $frey
     * @param array|null $input
     * @throws \Exception
     */
    public function __construct(IFreyClient $frey, $input = null)
    {
        if (empty($input)) {
            $input = $_SERVER;
        }

        $this->_frey = $frey;
        $this->_fillFrom($input);
        $this->_selectedLocale = $this->_initI18n();
    }

    /**
     * @return string
     * @throws \Exception
     */
    protected function _initI18n()
    {
        $locale = 'en_US.UTF-8';

        // i18n support
        // first step is getting browser language
        if (!empty($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
            $locale = \locale_accept_from_http($_SERVER['HTTP_ACCEPT_LANGUAGE']);
        }

        // second step is checking cookie
        if (isset($_COOKIE['language'])) {
            $locale = $_COOKIE['language'];
        } else if (!empty($_SERVER['HTTP_X_LOCALE'])) {
            // third step is checking headers (in case of mimir <-> frey interactions)
            $locale = $_SERVER['HTTP_X_LOCALE'];
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

        return $locale;
    }

    protected function _fillFrom(array $input): void
    {
        $this->_authToken = (empty($input['HTTP_X_AUTH_TOKEN']) ? '' : $input['HTTP_X_AUTH_TOKEN']);
        list($this->_requestedVersionMajor, $this->_requestedVersionMinor) = explode('.', (
            empty($input['HTTP_X_API_VERSION']) ? '1.0' : $input['HTTP_X_API_VERSION']
        ));

        $this->_currentEventId = (empty($input['HTTP_X_CURRENT_EVENT_ID'])
            ? null
            : intval($input['HTTP_X_CURRENT_EVENT_ID']));

        $this->_currentPersonId = (empty($input['HTTP_X_CURRENT_PERSON_ID'])
            ? null
            : intval($input['HTTP_X_CURRENT_PERSON_ID']));

        if (!empty($this->_currentPersonId)) {
            if (!$this->_frey->quickAuthorize($this->_currentPersonId, $this->getAuthToken())) {
                $this->_currentPersonId = null;
                $this->_authToken = null;
            } else {
                $this->_frey->getClient()->getHttpClient()->withHeaders([
                    'X-Auth-Token: ' . $this->_authToken,
                    'X-Current-Event-Id: ' . $this->_currentEventId ?: '0',
                    'X-Current-Person-Id: ' . $this->_currentPersonId
                ]);
                if (!empty($this->_currentEventId)) {
                    $this->_accessRules = $this->_frey->getAccessRules($this->_currentPersonId, $this->_currentEventId);
                } else {
                    // TODO: should we fetch common rules for person in this case?
                }
            }
        }

        $this->_requestedVersionMinor = $this->_requestedVersionMinor ? intval($this->_requestedVersionMinor) : 0;
        $this->_requestedVersionMajor = $this->_requestedVersionMajor ? intval($this->_requestedVersionMajor) : 1;
    }

    public function getAuthToken(): ?string
    {
        return $this->_authToken;
    }

    public function getAccessRuleValue(string $name)
    {
        if (!isset($this->_accessRules[$name])) {
            return null;
        }

        return $this->_accessRules[$name];
    }

    /**
     * @return int[]
     *
     * @psalm-return array{0: int, 1: int}
     */
    public function getRequestedVersion(): array
    {
        return [
            $this->_requestedVersionMajor,
            $this->_requestedVersionMinor
        ];
    }

    public function getSelectedLocale(): string
    {
        return $this->_selectedLocale;
    }

    public function getCurrentPersonId(): ?int
    {
        return $this->_currentPersonId;
    }

    public function sendVersionHeader($major, $minor): void
    {
        header('X-Api-Version: ' . intval($major) . '.' . intval($minor));
    }

    public function isGlobalWatcher(): bool
    {
        return $this->_authToken === '0000000000';
    }
}
