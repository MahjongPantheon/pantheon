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

require_once __DIR__ . '/../Controller.php';
require_once __DIR__ . '/../models/Auth.php';
require_once __DIR__ . '/../models/AccessManagement.php';
require_once __DIR__ . '/../exceptions/DuplicateEntity.php';
require_once __DIR__ . '/../exceptions/EntityNotFound.php';

class AccessController extends Controller
{
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
    public function getAccessRules($personId, $eventId)
    {
        $this->_logStart(__METHOD__, [$personId, $eventId]);
        $rules = $this->_getModel()->getAccessRules($personId, $eventId);
        $this->_logSuccess(__METHOD__, [$personId, $eventId]);
        return $rules;
    }

    /**
     * Client method to receive super-admin flag. Intended to be used only in Mimir/Rheda
     * to determine if used has super-admin privileges independently of any event.
     * Cached for 10 minutes.
     *
     * @param int $personId
     * @return bool
     * @throws \Exception
     */
    public function getSuperadminFlag($personId)
    {
        $this->_logStart(__METHOD__, [$personId]);
        $flag = $this->_getModel()->getSuperadminFlag($personId);
        $this->_logSuccess(__METHOD__, [$personId]);
        return $flag;
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
    public function getRuleValue($personId, $eventId, $ruleName)
    {
        $this->_logStart(__METHOD__, [$personId, $eventId, $ruleName]);
        $value = $this->_getModel()->getRuleValue($personId, $eventId, $ruleName);
        $this->_logSuccess(__METHOD__, [$personId, $eventId, $ruleName]);
        return $value;
    }

    /**
     * Get access rules for person.
     * - eventId may be null to get system-wide rules.
     * - Method results are not cached!
     * - To be used in admin panel, but not in client side!
     * - Does not output superadmin flag
     *
     * @param int $personId
     * @param int|null $eventId
     * @return array
     * @throws \Exception
     */
    public function getPersonAccess($personId, $eventId)
    {
        $this->_logStart(__METHOD__, [$personId, $eventId]);
        $rules = $this->_getModel()
            ->_checkAccessRights(InternalRules::GET_PERSON_ACCESS, $eventId)
            ->getPersonAccess($personId, $eventId);
        $this->_logSuccess(__METHOD__, [$personId, $eventId]);
        return $rules;
    }

    /**
     * Get access rules for group.
     * - eventId may be null to get system-wide rules.
     * - Method results are not cached!
     * - To be used in admin panel, but not in client side!
     * - Does not output superadmin flag
     *
     * @param int $groupId
     * @param int|null $eventId
     * @return array
     * @throws \Exception
     */
    public function getGroupAccess($groupId, $eventId)
    {
        $this->_logStart(__METHOD__, [$groupId, $eventId]);
        $rules = $this->_getModel()
            ->_checkAccessRights(InternalRules::GET_GROUP_ACCESS, $eventId)
            ->getGroupAccess($groupId, $eventId);
        $this->_logSuccess(__METHOD__, [$groupId, $eventId]);
        return $rules;
    }

    /**
     * Get all access rules for person.
     * - Method results are not cached!
     * - To be used in admin panel, but not in client side!
     *
     * @param int $personId
     * @return array
     * @throws \Exception
     */
    public function getAllPersonAccess($personId)
    {
        $this->_logStart(__METHOD__, [$personId]);
        $rules = $this->_getModel()
            ->_checkAccessRights(InternalRules::GET_ALL_PERSON_RULES)
            ->getAllPersonRules($personId);
        $this->_logSuccess(__METHOD__, [$personId]);
        return $rules;
    }

    /**
     * Get all access rules for event.
     * - Method results are not cached!
     * - To be used in admin panel, but not in client side!
     *
     * @param int $eventId
     * @return array
     * @throws \Exception
     */
    public function getAllEventRules($eventId)
    {
        $this->_logStart(__METHOD__, [$eventId]);
        $rules = $this->_getModel()
            ->_checkAccessRights(InternalRules::GET_ALL_EVENT_RULES)
            ->getAllEventRules($eventId);
        $this->_logSuccess(__METHOD__, [$eventId]);
        return $rules;
    }

    /**
     * Get all event admins
     * Format: [[rule_id => int, id => int, name => string], ...]
     *
     * @param int $eventId
     * @return array
     */
    public function getEventAdmins($eventId)
    {
        $this->_logStart(__METHOD__, [$eventId]);
        $admins = $this->_getModel()
            ->getEventAdmins($eventId);
        $this->_logSuccess(__METHOD__, [$eventId]);
        return $admins;
    }

    /**
     * Get all access rules for group.
     * - Method results are not cached!
     * - To be used in admin panel, but not in client side!
     *
     * @param int $groupId
     * @return array
     * @throws \Exception
     */
    public function getAllGroupAccess($groupId)
    {
        $this->_logStart(__METHOD__, [$groupId]);
        $rules = $this->_getModel()
            ->_checkAccessRights(InternalRules::GET_ALL_GROUP_RULES)
            ->getAllGroupRules($groupId);
        $this->_logSuccess(__METHOD__, [$groupId]);
        return $rules;
    }

    /**
     * Add new rule for a person.
     *
     * @param string $ruleName
     * @param string|int|boolean $ruleValue
     * @param string $ruleType   'bool', 'int' or 'enum'
     * @param int $personId
     * @param int $eventId
     *
     * @return int|null rule id
     *
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function addRuleForPerson($ruleName, $ruleValue, $ruleType, $personId, $eventId): ?int
    {
        $this->_logStart(__METHOD__, [$ruleName, $ruleValue, $ruleType, $personId, $eventId]);
        $ruleId = $this->_getModel()
            ->_checkAccessRightsWithInternal(InternalRules::ADD_RULE_FOR_PERSON, $eventId)
            ->addRuleForPerson($ruleName, $ruleValue, $ruleType, $personId, $eventId);
        if ($ruleId !== null) {
            $this->_logSuccess(__METHOD__, [$ruleName, $ruleValue, $ruleType, $personId, $eventId]);
        } else {
            $this->_logError(__METHOD__, [$ruleName, $ruleValue, $ruleType, $personId, $eventId]);
        }

        return $ruleId;
    }

    /**
     * Add new rule for a group.
     *
     * @param string $ruleName
     * @param string|int|boolean $ruleValue
     * @param string $ruleType   'bool', 'int' or 'enum'
     * @param int $groupId
     * @param int $eventId
     *
     * @return int|null rule id
     *
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function addRuleForGroup($ruleName, $ruleValue, $ruleType, $groupId, $eventId): ?int
    {
        $this->_logStart(__METHOD__, [$ruleName, $ruleValue, $ruleType, $groupId, $eventId]);
        $ruleId = $this->_getModel()
            ->_checkAccessRights(InternalRules::ADD_RULE_FOR_GROUP, $eventId)
            ->addRuleForGroup($ruleName, $ruleValue, $ruleType, $groupId, $eventId);
        if ($ruleId !== null) {
            $this->_logSuccess(__METHOD__, [$ruleName, $ruleValue, $ruleType, $groupId, $eventId]);
        }
        return $ruleId;
    }

    /**
     * Add new system-wide rule for a person.
     *
     * @param string $ruleName
     * @param string|int|boolean $ruleValue
     * @param string $ruleType   'bool', 'int' or 'enum'
     * @param int $personId
     *
     * @return int|null rule id
     *
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function addSystemWideRuleForPerson($ruleName, $ruleValue, $ruleType, $personId): ?int
    {
        $this->_logStart(__METHOD__, [$ruleName, $ruleValue, $ruleType, $personId]);
        $ruleId = $this->_getModel()
            ->_checkAccessRights(InternalRules::ADD_SYSTEM_WIDE_RULE_FOR_PERSON)
            ->addSystemWideRuleForPerson($ruleName, $ruleValue, $ruleType, $personId);
        if ($ruleId !== null) {
            $this->_logSuccess(__METHOD__, [$ruleName, $ruleValue, $ruleType, $personId]);
        }
        return $ruleId;
    }

    /**
     * Add new system-wide rule for a group.
     *
     * @param string $ruleName
     * @param string|int|boolean $ruleValue
     * @param string $ruleType   'bool', 'int' or 'enum'
     * @param int $groupId
     *
     * @return int|null rule id
     *
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function addSystemWideRuleForGroup($ruleName, $ruleValue, $ruleType, $groupId): ?int
    {
        $this->_logStart(__METHOD__, [$ruleName, $ruleValue, $ruleType, $groupId]);
        $ruleId = $this->_getModel()
            ->_checkAccessRights(InternalRules::ADD_SYSTEM_WIDE_RULE_FOR_GROUP)
            ->addSystemWideRuleForGroup($ruleName, $ruleValue, $ruleType, $groupId);
        if ($ruleId !== null) {
            $this->_logSuccess(__METHOD__, [$ruleName, $ruleValue, $ruleType, $groupId]);
        }
        return $ruleId;
    }

    /**
     * Update personal rule value and/or type
     *
     * @param int $ruleId
     * @param string|int|boolean $ruleValue
     * @param string $ruleType   'bool', 'int' or 'enum'
     * @return bool   success
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function updateRuleForPerson($ruleId, $ruleValue, $ruleType)
    {
        $this->_logStart(__METHOD__, [$ruleId, $ruleValue, $ruleType]);
        $success = $this->_getModel()->updateRuleForPerson($ruleId, $ruleValue, $ruleType);
        $this->_logSuccess(__METHOD__, [$ruleId, $ruleValue, $ruleType]);
        return $success;
    }

    /**
     * Update group rule value and/or type
     *
     * @param int $ruleId
     * @param string|int|boolean $ruleValue
     * @param string $ruleType   'bool', 'int' or 'enum'
     * @return bool   success
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function updateRuleForGroup($ruleId, $ruleValue, $ruleType)
    {
        $this->_logStart(__METHOD__, [$ruleId, $ruleValue, $ruleType]);
        $success = $this->_getModel()->updateRuleForGroup($ruleId, $ruleValue, $ruleType);
        $this->_logSuccess(__METHOD__, [$ruleId, $ruleValue, $ruleType]);
        return $success;
    }

    /**
     * Drop personal rule by id
     *
     * @param int $ruleId
     * @return bool
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function deleteRuleForPerson($ruleId)
    {
        $this->_logStart(__METHOD__, [$ruleId]);
        $this->_getModel()->deleteRuleForPerson($ruleId);
        $this->_logSuccess(__METHOD__, [$ruleId]);
        return true;
    }

    /**
     * Drop group rule by id
     *
     * @param int $ruleId
     * @return bool
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function deleteRuleForGroup($ruleId)
    {
        $this->_logStart(__METHOD__, [$ruleId]);
        $this->_getModel()->deleteRuleForGroup($ruleId);
        $this->_logSuccess(__METHOD__, [$ruleId]);
        return true;
    }

    /**
     * Clear cache for access rules of person in event.
     * Warning: clearing whole cache is explicitly NOT IMPLEMENTED. When altering groups access rules,
     * it's better to wait for 10mins than cause shitload on DB.
     *
     * @param int $personId
     * @param int $eventId
     * @return bool
     * @throws \Exception
     */
    public function clearAccessCache($personId, $eventId)
    {
        $this->_logStart(__METHOD__, [$personId, $eventId]);
        $success = $this->_getModel()
            ->_checkAccessRights(InternalRules::CLEAR_ACCESS_CACHE, $eventId)
            ->clearAccessCache($personId, $eventId);
        $this->_logSuccess(__METHOD__, [$personId, $eventId]);
        return $success;
    }

    /**
     * Get rule list with translations to selected locale
     *
     * @return array
     * @throws \Exception
     */
    public function getRulesList()
    {
        $this->_logStart(__METHOD__, []);
        $rules = InternalRules::getRules();
        $this->_logSuccess(__METHOD__, []);
        return $rules;
    }

    /**
     * Get list of event IDs where specified person has admin privileges.
     *
     * @param int $personId
     * @return array
     * @throws \Exception
     */
    public function getOwnedEventIds($personId)
    {
        $this->_logStart(__METHOD__, [$personId]);
        $rules = $this->_getModel()
            ->getAllPersonRulesOfType($personId, InternalRules::ADMIN_EVENT);
        $events = array_keys(array_filter($rules, function ($rule) {
            return !!$rule['value'];
        }));
        $this->_logSuccess(__METHOD__, [$personId]);
        return $events;
    }

    /**
     * @return AccessManagementModel
     */
    protected function _getModel()
    {
        return new AccessManagementModel($this->_db, $this->_config, $this->_meta);
    }
}
