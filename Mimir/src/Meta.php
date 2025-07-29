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
     * @var IFreyClient
     */
    protected $_frey;
    /**
     * @var \Common\Storage
     */
    protected $_storage;
    /**
     * @var array
     */
    protected $_eventAdmins;
    /**
     * @var bool
     */
    protected $_superadmin = false;

    /**
     * Meta constructor.
     * @param IFreyClient $frey
     * @param Config $config
     * @param array|null $input
     * @throws \Exception
     */
    public function __construct(IFreyClient $frey, \Common\Storage $storage, Config $config, $input = null)
    {
        if (empty($input)) {
            $input = $_SERVER;
        }

        $this->_frey = $frey;
        $this->_storage = $storage;
        $this->_selectedLocale = $this->_initI18n();
        $this->_fillFrom($input);

        // for unit/integration testing purposes
        $testingToken = $config->getStringValue('testing_token');
        if (!empty($testingToken) && $this->_authToken == $testingToken) {
            $this->_superadmin = true;
        }
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
        if ($this->_storage->getLang()) {
            $locale = $this->_storage->getLang();
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

        $this->_currentEventId = (empty($input['HTTP_X_CURRENT_EVENT_ID'])
            ? null
            : intval($input['HTTP_X_CURRENT_EVENT_ID']));

        $this->_currentPersonId = (empty($input['HTTP_X_CURRENT_PERSON_ID'])
            ? null
            : intval($input['HTTP_X_CURRENT_PERSON_ID']));

        if (!empty($this->_currentPersonId)) {
            try {
                $this->_frey->withHeaders([
                    'X-Twirp' => 'true',
                    'X-Auth-Token' => $this->_authToken,
                    'X-Current-Event-Id' => ($this->_currentEventId ?: '0'),
                    'X-Current-Person-Id' => $this->_currentPersonId,
                    'X-Locale' => $this->getSelectedLocale()
                ]);

                if (!$this->_frey->quickAuthorize($this->_currentPersonId, $this->getAuthToken() ?? '')) {
                    $this->_currentPersonId = null;
                    $this->_authToken = null;
                }
                if (!empty($this->_currentEventId) && !empty($this->_currentPersonId)) {
                    $this->_superadmin = $this->_frey->getSuperadminFlag($this->_currentPersonId);
                    $this->_eventAdmins = $this->_frey->getEventAdmins($this->_currentEventId);
                } else if (!empty($this->_currentPersonId)) {
                    $this->_superadmin = $this->_frey->getSuperadminFlag($this->_currentPersonId);
                }
            } catch (\Exception $e) {
                $this->_currentPersonId = null;
                $this->_authToken = null;
            }
        }
    }

    public function getAuthToken(): ?string
    {
        return $this->_authToken;
    }

    /**
     * @return bool
     */
    public function isSuperadmin()
    {
        return $this->_superadmin;
    }

    /**
     * @return bool
     */
    public function isEventAdmin()
    {
        if ($this->_superadmin) {
            return true;
        }
        if (!$this->_currentPersonId) {
            return false;
        }
        if (count(array_filter($this->_eventAdmins, function ($admin) {
            return $admin['id'] === $this->_currentPersonId;
        })) > 0) {
            return true;
        }
        return false;
    }

    /**
     * @param int $eventId
     * @return bool
     */
    public function isEventAdminById($eventId)
    {
        if ($this->_superadmin) {
            return true;
        }
        if (!$this->_currentPersonId) {
            return false;
        }
        $eventAdmins = $this->_frey->getEventAdmins($eventId);
        if (count(array_filter($this->_eventAdmins, function ($admin) {
            return $admin['id'] === $this->_currentPersonId;
        })) > 0) {
            return true;
        }
        return false;
    }

    /**
     * @param int $eventId
     * @return bool
     */
    public function isEventRefereeById($eventId)
    {
        if ($this->_superadmin) {
            return true;
        }
        if (!$this->_currentPersonId) {
            return false;
        }
        $eventAdmins = $this->_frey->getEventReferees($eventId);
        if (count(array_filter($this->_eventAdmins, function ($admin) {
            return $admin['id'] === $this->_currentPersonId;
        })) > 0) {
            return true;
        }
        return false;
    }

    public function getSelectedLocale(): string
    {
        return $this->_selectedLocale;
    }

    public function getCurrentPersonId(): ?int
    {
        return $this->_currentPersonId;
    }

    /**
     * @param mixed $major
     * @param mixed $minor
     */
    public function sendVersionHeader($major, $minor): void
    {
        header('X-Api-Version: ' . intval($major) . '.' . intval($minor));
        header('X-Release: ' . trim(file_get_contents(__DIR__ . '/../../Common/ReleaseTag.txt') ?: ''));
    }

    public function isGlobalWatcher(): bool
    {
        return $this->_authToken === '0000000000';
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
     * @param int $eventId
     * @return bool
     */
    public function isAuthorizedForEvent($eventId)
    {
        return $this->_currentEventId === $eventId;
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
