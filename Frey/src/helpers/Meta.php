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

class Meta
{
    /**
     * @var string
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
     * Meta constructor.
     * @param array|null $input
     * @param array|null $cookieInput
     * @throws \Exception
     */
    public function __construct($input = null, $cookieInput = null)
    {
        if (empty($input)) {
            $input = $_SERVER;
        }

        if (empty($cookieInput)) {
            $cookieInput = $_COOKIE;
        }

        $this->_fillFrom($input, $cookieInput);
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

    protected function _fillFrom(?array $input, ?array $cookieInput): void
    {
        // Rheda and Mimir MUST pass authToken from cookie to Frey as X-Auth-Token header.
        // Also they MUST pass currentEventId as X-Current-Event-Id and currentPersonId as X-Current-Person-Id.
        // External services may choose to use either cookie or header.
        $this->_authToken = (empty($input['HTTP_X_AUTH_TOKEN'])
            ? (
                empty($cookieInput['authToken'])
                ? ''
                : trim($cookieInput['authToken'])
            )
            : trim($input['HTTP_X_AUTH_TOKEN']));

        $this->_currentEventId = (empty($input['HTTP_X_CURRENT_EVENT_ID'])
            ? (
            empty($cookieInput['currentEventId'])
                ? null
                : intval($cookieInput['currentEventId'])
            )
            : intval($input['HTTP_X_CURRENT_EVENT_ID']));

        $this->_currentPersonId = (empty($input['HTTP_X_CURRENT_PERSON_ID'])
            ? (
            empty($cookieInput['currentPersonId'])
                ? null
                : intval($cookieInput['currentPersonId'])
            )
            : intval($input['HTTP_X_CURRENT_PERSON_ID']));

        list($this->_requestedVersionMajor, $this->_requestedVersionMinor) = explode('.', (
            empty($input['HTTP_X_API_VERSION']) ? '1.0' : $input['HTTP_X_API_VERSION']
        ));

        $this->_requestedVersionMinor = $this->_requestedVersionMinor ? intval($this->_requestedVersionMinor) : 0;
        $this->_requestedVersionMajor = $this->_requestedVersionMajor ? intval($this->_requestedVersionMajor) : 1;
    }

    public function getAuthToken(): string
    {
        return $this->_authToken;
    }

    public function getCurrentEventId(): ?int
    {
        return $this->_currentEventId;
    }

    public function getCurrentPersonId(): ?int
    {
        return $this->_currentPersonId;
    }

    public function getSelectedLocale(): string
    {
        return $this->_selectedLocale;
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

    /**
     * @param string $major
     * @param string $minor
     */
    public function sendVersionHeader(string $major, string $minor): void
    {
        header('X-Api-Version: ' . intval($major) . '.' . intval($minor));
    }
}
