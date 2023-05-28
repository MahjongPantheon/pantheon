<?php
/*  Pantheon common files
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
namespace Common;

class Storage {
    // These should be same as in Tyr cookie interface (storage.ts)
    const AUTH_TOKEN_KEY = 'auth';
    const PERSON_ID_KEY = 'pid';
    const EVENT_ID_KEY = 'eid';
    const LANG_KEY = 'lng';
    const THEME_KEY = 'thm';
    const SINGLE_DEVICE_MODE_KEY = 'sdm';

    protected string $_cookieDomain;
    protected ?string $_authToken;
    protected ?int $_personId;
    protected ?int $_eventId;
    protected ?string $_lang;
    protected ?string $_theme;
    protected ?bool $_singleDeviceMode;
    protected readonly int $_defaultPeriod;
    protected readonly int $_deleteTimestamp;

    public function __construct(string $cookieDomain)
    {
        $this->_cookieDomain = $cookieDomain;
        $this->_authToken = empty($_COOKIE[self::AUTH_TOKEN_KEY]) ? null : trim(strval($_COOKIE[self::AUTH_TOKEN_KEY]));
        $this->_personId = empty($_COOKIE[self::PERSON_ID_KEY]) ? null : intval($_COOKIE[self::PERSON_ID_KEY]);
        $this->_eventId = empty($_COOKIE[self::EVENT_ID_KEY]) ? null : intval($_COOKIE[self::EVENT_ID_KEY]);
        $this->_lang = empty($_COOKIE[self::LANG_KEY]) ? null : trim(strval($_COOKIE[self::LANG_KEY]));
        $this->_theme = empty($_COOKIE[self::THEME_KEY]) ? null : trim(strval($_COOKIE[self::THEME_KEY]));
        $this->_singleDeviceMode = empty($_COOKIE[self::SINGLE_DEVICE_MODE_KEY]) ? null : intval($_COOKIE[self::SINGLE_DEVICE_MODE_KEY]) === 1;
        $this->_defaultPeriod = time() + 365 * 24 * 3600;
        $this->_deleteTimestamp = time() - 365 * 24 * 3600;
    }

    /**
     * @return string|null
     */
    public function getAuthToken(): string|null
    {
        return $this->_authToken;
    }

    /**
     * @param string|null $authToken
     * @return Storage
     */
    public function setAuthToken(?string $authToken): self
    {
        $this->_authToken = $authToken;
        setcookie(self::AUTH_TOKEN_KEY, $this->_authToken, $this->_defaultPeriod, '/', $this->_cookieDomain);
        return $this;
    }

    /**
     * @return Storage
     */
    public function deleteAuthToken(): self
    {
        setcookie(self::AUTH_TOKEN_KEY, '', $this->_deleteTimestamp, '/', $this->_cookieDomain);
        return $this;
    }

    /**
     * @return int|null
     */
    public function getPersonId(): ?int
    {
        return $this->_personId;
    }

    /**
     * @param int|null $personId
     * @return Storage
     */
    public function setPersonId(?int $personId): self
    {
        $this->_personId = $personId;
        setcookie(self::PERSON_ID_KEY, $this->_personId, $this->_defaultPeriod, '/', $this->_cookieDomain);
        return $this;
    }

    /**
     * @return Storage
     */
    public function deletePersonId(): self
    {
        setcookie(self::PERSON_ID_KEY, '', $this->_deleteTimestamp, '/', $this->_cookieDomain);
        return $this;
    }

    /**
     * @return int|null
     */
    public function getEventId(): ?int
    {
        return $this->_eventId;
    }

    /**
     * @param int|null $eventId
     * @return Storage
     */
    public function setEventId(?int $eventId): self
    {
        $this->_eventId = $eventId;
        setcookie(self::EVENT_ID_KEY, $this->_eventId, $this->_defaultPeriod, '/', $this->_cookieDomain);
        return $this;
    }

    /**
     * @return Storage
     */
    public function deleteEventId(): self
    {
        setcookie(self::EVENT_ID_KEY, '', $this->_deleteTimestamp, '/', $this->_cookieDomain);
        return $this;
    }

    /**
     * @return string|null
     */
    public function getLang(): string|null
    {
        return $this->_lang;
    }

    /**
     * @param string|null $lang
     * @return Storage
     */
    public function setLang(?string $lang): self
    {
        $this->_lang = $lang;
        setcookie(self::LANG_KEY, $this->_lang, $this->_defaultPeriod, '/', $this->_cookieDomain);
        return $this;
    }

    /**
     * @return Storage
     */
    public function deleteLang(): self
    {
        setcookie(self::LANG_KEY, '', $this->_deleteTimestamp, '/', $this->_cookieDomain);
        return $this;
    }

    /**
     * @return string|null
     */
    public function getTheme(): string|null
    {
        return $this->_theme;
    }

    /**
     * @param string|null $theme
     * @return Storage
     */
    public function setTheme(?string $theme): self
    {
        $this->_theme = $theme;
        setcookie(self::THEME_KEY, $this->_theme, $this->_defaultPeriod, '/', $this->_cookieDomain);
        return $this;
    }

    /**
     * @return Storage
     */
    public function deleteTheme(): self
    {
        setcookie(self::THEME_KEY, '', $this->_deleteTimestamp, '/', $this->_cookieDomain);
        return $this;
    }

    /**
     * @return bool|null
     */
    public function getSingleDeviceMode(): ?bool
    {
        return $this->_singleDeviceMode;
    }

    /**
     * @param bool|null $singleDeviceMode
     * @return Storage
     */
    public function setSingleDeviceMode(?bool $singleDeviceMode): self
    {
        $this->_singleDeviceMode = $singleDeviceMode;
        setcookie(self::SINGLE_DEVICE_MODE_KEY, $this->_singleDeviceMode ? 1 : 0, $this->_defaultPeriod, '/', $this->_cookieDomain);
        return $this;
    }

    /**
     * @return Storage
     */
    public function deleteSingleDeviceMode(): self
    {
        setcookie(self::SINGLE_DEVICE_MODE_KEY, '', $this->_deleteTimestamp, '/', $this->_cookieDomain);
        return $this;
    }
}
