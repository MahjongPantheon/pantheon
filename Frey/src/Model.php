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

use Memcached;

require_once 'exceptions/AccessDenied.php';

abstract class Model
{
    /**
     * @var IDb
     */
    protected $_db;

    /**
     * @var Config
     */
    protected $_config;

    /**
     * @var Meta
     */
    protected $_meta;

    /**
     * @var Memcached
     */
    protected $_mc;

    /**
     * @var PersonPrimitive|null
     */
    protected $_authorizedPerson = null;

    /**
     * @var array
     */
    protected $_currentAccess = [];

    /**
     * Model constructor.
     * @param IDb $db
     * @param Config $config
     * @param Meta $meta
     * @param Memcached $mc
     * @throws \Exception
     */
    public function __construct(IDb $db, Config $config, Meta $meta, Memcached $mc)
    {
        $this->_db = $db;
        $this->_config = $config;
        $this->_meta = $meta;
        $this->_mc = $mc;
        $this->_authorizedPerson = $this->_fetchAuthorizedPerson();

        // for unit/integration testing purposes
        $testingToken = $this->_config->getValue('testing_token');
        if (!empty($testingToken) && $this->_meta->getAuthToken() == $testingToken) {
            $this->_authorizedPerson = PersonPrimitive::findById($db, $this->_fetchSuperAdminId())[0];
        }

        $this->_currentAccess = $this->_fetchPersonAccess();
    }

    /**
     * @return array
     * @throws \Exception
     */
    private function _fetchSuperAdminId()
    {
        $access = PersonAccessPrimitive::findSuperAdminId($this->_db);
        return array_map(function (PersonAccessPrimitive $p) {
            return $p->getPersonId();
        }, $access);
    }

    /**
     * @return PersonPrimitive|null
     * @throws \Exception
     */
    protected function _fetchAuthorizedPerson()
    {
        if (empty($this->_meta->getAuthToken()) || empty($this->_meta->getCurrentPersonId())) {
            return null;
        }

        $persons = PersonPrimitive::findById($this->_db, [$this->_meta->getCurrentPersonId()]);

        if (!empty($persons)) {
            if (self::checkPasswordQuick($this->_meta->getAuthToken(), $persons[0]->getAuthHash())) {
                return $persons[0];
            }
        }

        return null;
    }

    /**
     * Check if client-side auth token matches save password hash
     *
     * @param string $clientSideToken
     * @param string $authHash
     * @return bool
     */
    public static function checkPasswordQuick(string $clientSideToken, string $authHash): bool
    {
        $pwd = apcu_fetch('pwcheck_' . $clientSideToken . $authHash);
        if ($pwd !== false) {
            return $pwd === 1;
        }

        $pwd = password_verify($clientSideToken, $authHash);
        apcu_store('pwcheck_' . $clientSideToken . $authHash, $pwd ? 1 : 0, 60 * 60 * 24 * 7);
        return $pwd;
    }

    /**
     * @return array
     * @throws \Exception
     */
    protected function _fetchPersonAccess()
    {
        if (empty($this->_authorizedPerson)) {
            return [];
        }

        $pId = $this->_authorizedPerson->getId();
        if (empty($pId)) {
            return []; // deidented primitive, no rights
        }

        return $this->_meta->getCurrentEventId() === null
            ? $this->_getSystemWideRules($pId)
            : $this->_getAccessRules($pId, $this->_meta->getCurrentEventId());
    }

    //////////////////////////////////////////////////////////////////
    /// Basic access methods
    /// Stored in base model because they're required at bootstrap.
    /// Exposed at AccessManagement model for external use.
    //////////////////////////////////////////////////////////////////

    const CACHE_TTL_SEC = 10 * 60;

    /**
     * Get apcu cache key for access rules
     *
     * @param int $personId
     * @param string $eventId   numeric string or '__system-wide'
     *
     * @return string
     */
    protected static function _getAccessCacheKey(int $personId, string $eventId)
    {
        return "access_${personId}_${eventId}";
    }

    /**
     * Primary client method, aggregating rules from groups and person.
     * Get array of access rules for person in event.
     * Cached for 10 minutes.
     *
     * @param int $personId
     * @param int $eventId
     * @return array
     * @throws \Exception
     */
    protected function _getAccessRules(int $personId, int $eventId)
    {
        $rules = apcu_fetch($this->_getAccessCacheKey($personId, (string)$eventId));
        if ($rules !== false) {
            return $rules;
        }

        $persons = PersonPrimitive::findById($this->_db, [$personId]);
        if (empty($persons)) {
            throw new EntityNotFoundException('Person with id #' . $personId . ' not found in DB', 401);
        }

        $resultingRules = [];
        foreach ($this->_getGroupAccessRules($persons[0]->getGroupIds(), $eventId) as $rule) {
            $systemWideRuleToBeApplied = empty($rule->getEventId()) && !isset($resultingRules[$rule->getAclName()]);
            if ($systemWideRuleToBeApplied || !empty($rule->getEventId()) /* not systemwide rule */) {
                $resultingRules[$rule->getAclName()] = $rule->getAclValue();
            }
        }
        foreach ($this->_getPersonAccessRules($personId, $eventId) as $rule) {
            // Person rules have higher priority than group rules
            $systemWideRuleToBeApplied = empty($rule->getEventId()) && !isset($resultingRules[$rule->getAclName()]);
            if ($systemWideRuleToBeApplied || !empty($rule->getEventId()) /* not systemwide rule */) {
                $resultingRules[$rule->getAclName()] = $rule->getAclValue();
            }
        }

        if ($persons[0]->getIsSuperadmin()) {
            $resultingRules[InternalRules::IS_SUPER_ADMIN] = '1';
        }

        apcu_store($this->_getAccessCacheKey($personId, (string)$eventId), $resultingRules, self::CACHE_TTL_SEC);
        return $resultingRules;
    }

    /**
     * Primary client method, aggregating rules from groups and person.
     * Get array of access rules for person system-wide
     * Cached for 10 minutes.
     *
     * @param int $personId
     * @return array
     * @throws \Exception
     */
    protected function _getSystemWideRules(int $personId)
    {
        $rules = apcu_fetch($this->_getAccessCacheKey($personId, '__system-wide'));
        if ($rules !== false) {
            return $rules;
        }

        $persons = PersonPrimitive::findById($this->_db, [$personId]);
        if (empty($persons)) {
            throw new EntityNotFoundException('Person with id #' . $personId . ' not found in DB', 401);
        }

        $resultingRules = [];
        foreach ($this->_getGroupAccessSystemWideRules($persons[0]->getGroupIds()) as $rule) {
            $resultingRules[$rule->getAclName()] = $rule->getAclValue();
        }
        foreach ($this->_getPersonAccessSystemWideRules($personId) as $rule) {
            // Person rules have higher priority than group rules
            $resultingRules[$rule->getAclName()] = $rule->getAclValue();
        }

        if ($persons[0]->getIsSuperadmin()) {
            $resultingRules[InternalRules::IS_SUPER_ADMIN] = '1';
        }

        apcu_store($this->_getAccessCacheKey($personId, '__system-wide'), $resultingRules, self::CACHE_TTL_SEC);
        return $resultingRules;
    }

    /**
     * Get single rule for person in event. Hardly relies on cache.
     * Also counts group rules if person belongs to one or more groups.
     * Typically should not be used when more than one value should be retrieved.
     * Returns null if no data found for provided person/event ids or rule name.
     *
     * @param int $personId
     * @param int $eventId
     * @param string $ruleName
     * @return mixed
     * @throws \Exception
     */
    protected function _getRuleValue(int $personId, int $eventId, string $ruleName)
    {
        $rules = $this->_getAccessRules($personId, $eventId);
        if (empty($rules[$ruleName])) {
            return null;
        }
        return $rules[$ruleName];
    }

    /**
     * @param int $personId
     * @param int|null $eventId
     *
     * @return PersonAccessPrimitive[]
     * @throws \Exception
     */
    protected function _getPersonAccessRules(int $personId, ?int $eventId)
    {
        return array_filter(
            PersonAccessPrimitive::findByPerson($this->_db, [$personId]),
            function (PersonAccessPrimitive $rule) use ($eventId) {
                return empty($rule->getEventId()) // system-wide person rules
                    || $eventId == $rule->getEventId();
            }
        );
    }

    /**
     * @param int[] $groupIds
     * @param int|null $eventId
     *
     * @return GroupAccessPrimitive[]
     * @throws \Exception
     */
    protected function _getGroupAccessRules(array $groupIds, ?int $eventId)
    {
        return array_filter(
            GroupAccessPrimitive::findByGroup($this->_db, $groupIds),
            function (GroupAccessPrimitive $rule) use ($eventId) {
                return empty($rule->getEventId()) // system-wide group rules
                    || $eventId == $rule->getEventId();
            }
        );
    }

    /**
     * @param int $personId
     * @return PersonAccessPrimitive[]
     * @throws \Exception
     */
    protected function _getPersonAccessSystemWideRules(int $personId)
    {
        return array_filter(
            PersonAccessPrimitive::findByPerson($this->_db, [$personId]),
            function (PersonAccessPrimitive $rule) {
                return empty($rule->getEventId());
            }
        );
    }

    /**
     * @param int[] $groupIds
     *
     * @return GroupAccessPrimitive[]
     * @throws \Exception
     */
    protected function _getGroupAccessSystemWideRules(array $groupIds)
    {
        return array_filter(
            GroupAccessPrimitive::findByGroup($this->_db, $groupIds),
            function (GroupAccessPrimitive $rule) {
                return empty($rule->getEventId());
            }
        );
    }

    /**
     * @param string $key
     * @param int|null $eventId
     *
     * @throws AccessDeniedException
     *
     * @return $this
     */
    public function _checkAccessRights(string $key, $eventId = null): self
    {
        $eventMatches = empty($eventId) || $eventId == $this->_meta->getCurrentEventId();
        if (!$eventMatches) {
            throw new AccessDeniedException('This event action is not allowed for you');
        }

        $hasAccess = !empty($this->_authorizedPerson) && (
            $this->_authorizedPerson->getIsSuperadmin() || (
                !empty($this->_currentAccess[$key]) && $this->_currentAccess[$key] == true
            )
        );
        if (!$hasAccess) {
            throw new AccessDeniedException('This action is not allowed for you');
        }

        return $this;
    }

    /**
     * Loose check of rights.
     * Should only be used on non-admin api methods called from mimir, but not from tyr.
     * E.g., method of adding admin rights to just created event.
     *
     * @param string $key
     * @param int|null $eventId
     * @return $this
     * @throws AccessDeniedException
     */
    public function _checkAccessRightsWithInternal(string $key, $eventId = null)
    {
        // For direct calls from Mimir/Rheda
        if (!empty($_SERVER['HTTP_X_INTERNAL_QUERY_SECRET']) && $_SERVER['HTTP_X_INTERNAL_QUERY_SECRET'] === $this->_config->getValue('admin.internalQuerySecret')) {
            return $this;
        }

        return $this->_checkAccessRights($key, $eventId);
    }
}
