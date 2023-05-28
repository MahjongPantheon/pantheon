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
     * @param \Common\Storage $storage
     * @param array|null $input
     * @throws \Exception
     */
    public function __construct(\Common\Storage $storage, $input = null)
    {
        if (empty($input)) {
            $input = $_SERVER;
        }

        $this->_fillFrom($storage, $input);
        $this->_selectedLocale = $this->_initI18n($storage->getLang());
    }

    /**
     * @return string
     * @throws \Exception
     */
    protected function _initI18n(?string $langFromCookies)
    {
        $locale = 'en_US.UTF-8';

        // i18n support
        // first step is getting browser language
        if (!empty($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
            $locale = \locale_accept_from_http($_SERVER['HTTP_ACCEPT_LANGUAGE']);
        }

        // second step is checking cookie
        if (!empty($langFromCookies)) {
            $locale = $langFromCookies;
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

    protected function _fillFrom(\Common\Storage $storage, ?array $input): void
    {
        // All services MUST pass authToken from cookie to Frey as X-Auth-Token header.
        // Also they MUST pass currentEventId as X-Current-Event-Id and currentPersonId as X-Current-Person-Id.
        // External services may choose to use either cookie or header.
        $this->_authToken = (empty($input['HTTP_X_AUTH_TOKEN'])
            ? (
                empty($storage->getAuthToken())
                ? ''
                : $storage->getAuthToken()
            )
            : trim($input['HTTP_X_AUTH_TOKEN']));

        $this->_currentEventId = (empty($input['HTTP_X_CURRENT_EVENT_ID'])
            ? (
            empty($storage->getEventId())
                ? null
                : $storage->getEventId()
            )
            : intval($input['HTTP_X_CURRENT_EVENT_ID']));

        $this->_currentPersonId = (empty($input['HTTP_X_CURRENT_PERSON_ID'])
            ? (
            empty($storage->getPersonId())
                ? null
                : $storage->getPersonId()
            )
            : intval($input['HTTP_X_CURRENT_PERSON_ID']));
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
     * @param string $major
     * @param string $minor
     */
    public function sendVersionHeader(string $major, string $minor): void
    {
        header('X-Api-Version: ' . intval($major) . '.' . intval($minor));
    }

    /**
     * @deprecated only for testing purposes!
     * @param int|null $eventId
     * @return void
     */
    public function __setEventId($eventId)
    {
        $this->_currentEventId = $eventId;
    }

    /**
     * @deprecated only for testing purposes!
     * @param int|null $personId
     * @return void
     */
    public function __setPersonId($personId)
    {
        $this->_currentPersonId = $personId;
    }

    /**
     * @deprecated only for testing purposes!
     * @param string $token
     * @return void
     */
    public function __setAuthToken($token)
    {
        $this->_authToken = $token;
    }
}
