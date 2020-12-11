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
     *
     * @param int $personId
     * @param int|null $eventId
     * @return array
     * @throws \Exception
     */
    public function getPersonAccess($personId, $eventId)
    {
        $this->_logStart(__METHOD__, [$personId, $eventId]);
        $rules = $this->_getModel()->getPersonAccess($personId, $eventId);
        $this->_logSuccess(__METHOD__, [$personId, $eventId]);
        return $rules;
    }

    /**
     * Get access rules for group.
     * - eventId may be null to get system-wide rules.
     * - Method results are not cached!
     * - To be used in admin panel, but not in client side!
     *
     * @param int $groupId
     * @param int|null $eventId
     * @return array
     * @throws \Exception
     */
    public function getGroupAccess($groupId, $eventId)
    {
        $this->_logStart(__METHOD__, [$groupId, $eventId]);
        $rules = $this->_getModel()->getGroupAccess($groupId, $eventId);
        $this->_logSuccess(__METHOD__, [$groupId, $eventId]);
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
     * @return int rule id
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function addRuleForPerson($ruleName, $ruleValue, $ruleType, $personId, $eventId)
    {
        $this->_logStart(__METHOD__, [$ruleName, $ruleValue, $ruleType, $personId, $eventId]);
        $ruleId = $this->_getModel()->addRuleForPerson($ruleName, $ruleValue, $ruleType, $personId, $eventId);
        if ($ruleId !== null) {
            $this->_logSuccess(__METHOD__, [$ruleName, $ruleValue, $ruleType, $personId, $eventId]);
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
     * @return int rule id
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function addRuleForGroup($ruleName, $ruleValue, $ruleType, $groupId, $eventId)
    {
        $this->_logStart(__METHOD__, [$ruleName, $ruleValue, $ruleType, $groupId, $eventId]);
        $ruleId = $this->_getModel()->addRuleForGroup($ruleName, $ruleValue, $ruleType, $groupId, $eventId);
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
     * @return int rule id
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function addSystemWideRuleForPerson($ruleName, $ruleValue, $ruleType, $personId)
    {
        $this->_logStart(__METHOD__, [$ruleName, $ruleValue, $ruleType, $personId]);
        $ruleId = $this->_getModel()->addSystemWideRuleForPerson($ruleName, $ruleValue, $ruleType, $personId);
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
     * @return int rule id
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function addSystemWideRuleForGroup($ruleName, $ruleValue, $ruleType, $groupId)
    {
        $this->_logStart(__METHOD__, [$ruleName, $ruleValue, $ruleType, $groupId]);
        $ruleId = $this->_getModel()->addSystemWideRuleForGroup($ruleName, $ruleValue, $ruleType, $groupId);
        if ($ruleId !== null) {
            $this->_logSuccess(__METHOD__, [$ruleName, $ruleValue, $ruleType, $groupId]);
        }
        return $ruleId;
    }

    /**
     * Update personal rule value and/or type
     *
     * @param integer $ruleId
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
        $success = $this->_getModel()->clearAccessCache($personId, $eventId);
        $this->_logSuccess(__METHOD__, [$personId, $eventId]);
        return $success;
    }

    /**
     * @return AccessManagementModel
     */
    protected function _getModel()
    {
        return new AccessManagementModel($this->_db, $this->_config, $this->_meta);
    }
}
