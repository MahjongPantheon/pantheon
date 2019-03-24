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

require_once __DIR__ . '/FreyClient.php';

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
     * @var FreyClient
     */
    protected $_frey;
    /**
     * @var array
     */
    protected $_accessRules;

    public function __construct(FreyClient $frey, $input = null)
    {
        if (empty($input)) {
            $input = $_SERVER;
        }

        $this->_frey = $frey;
        $this->_fillFrom($input);
    }

    protected function _fillFrom($input)
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

    public function getAuthToken()
    {
        return $this->_authToken;
    }

    public function getAccessRuleValue($name)
    {
        if (!isset($this->_accessRules[$name])) {
            return null;
        }

        return $this->_accessRules[$name];
    }

    public function getRequestedVersion()
    {
        return [
            $this->_requestedVersionMajor,
            $this->_requestedVersionMinor
        ];
    }

    public function sendVersionHeader($major, $minor)
    {
        header('X-Api-Version: ' . intval($major) . '.' . intval($minor));
    }

    public function isGlobalWatcher()
    {
        return $this->_authToken === '0000000000';
    }

    /**
     * @return FreyClient
     */
    public function getFreyClient()
    {
        return $this->_frey;
    }
}
