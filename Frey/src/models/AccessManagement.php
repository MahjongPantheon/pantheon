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

require_once __DIR__ . '/../Model.php';
require_once __DIR__ . '/../primitives/Group.php';
require_once __DIR__ . '/../primitives/Person.php';
require_once __DIR__ . '/../primitives/GroupAccess.php';
require_once __DIR__ . '/../primitives/PersonAccess.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';

class AccessManagementModel extends Model
{
    //////// Client usage methods (non-admin)

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
    public function getAccessRules(int $personId, int $eventId)
    {
        return $this->_getAccessRules($personId, $eventId);
    }

    /**
     * Get single rule for person in event. Hardly relies on cache.
     * Also counts group rules if person belongs to one or more groups.
     * Typically should not be used when more than one value should be retrieved.
     * Returns null if no data found for provided person/event ids or rule name.
     *
     * @param $personId
     * @param $eventId
     * @param $ruleName
     * @return mixed
     * @throws \Exception
     */
    public function getRuleValue($personId, $eventId, $ruleName)
    {
        return $this->_getRuleValue($personId, $eventId, $ruleName);
    }

    //////// Admin methods

    /**
     * Get access rules for person.
     * - eventId may be null to get system-wide rules.
     * - Method results are not cached!
     *
     * @param $personId
     * @param $eventId
     * @return array
     * @throws \Exception
     */
    public function getPersonAccess($personId, $eventId)
    {
        // TODO: check access admin rights here...
        $rules = $this->_getPersonAccessRules($personId, $eventId);
        $eventRelatedRules = array_filter($rules, function (PersonAccessPrimitive $rule) use ($eventId) {
            if (empty($eventId)) { // required to get system-wide rules
                return true;
            }
            return !empty($rule->getEventsId());
        });

        $resultingRules = [];
        foreach ($eventRelatedRules as $rule) {
            $resultingRules[$rule->getAclName()] = $rule->getAclValue();
        }

        return $resultingRules;
    }

    /**
     * Get access rules for group.
     * - eventId may be null to get system-wide rules.
     * - Method results are not cached!
     *
     * @param $groupId
     * @param $eventId
     * @return array
     * @throws \Exception
     */
    public function getGroupAccess($groupId, $eventId)
    {
        // TODO: check access admin rights here...
        $rules = $this->_getGroupAccessRules([$groupId], $eventId);
        $eventRelatedRules = array_filter($rules, function (GroupAccessPrimitive $rule) use ($eventId) {
            if (empty($eventId)) { // required to get system-wide rules
                return true;
            }
            return !empty($rule->getEventsId());
        });

        $resultingRules = [];
        foreach ($eventRelatedRules as $rule) {
            $resultingRules[$rule->getAclName()] = $rule->getAclValue();
        }

        return $resultingRules;
    }

    /**
     * Add new rule for a person.
     *
     * @param $ruleName
     * @param $ruleValue
     * @param $ruleType   'bool', 'int' or 'enum'
     * @param $personId
     * @param $eventId
     * @return int|null Rule id
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function addRuleForPerson($ruleName, $ruleValue, $ruleType, $personId, $eventId)
    {
        // TODO: check access admin rights here...
        $existingRules = $this->getPersonAccess($personId, $eventId);
        if (!empty($existingRules[$ruleName])) {
            throw new DuplicateEntityException(
                'Rule ' . $ruleName . ' already exists for person ' . $personId . ' at event ' . $eventId,
                402
            );
        }

        $persons = PersonPrimitive::findById($this->_db, [$personId]);
        if (empty($persons)) {
            throw new EntityNotFoundException('Person with id #' . $personId . ' not found in DB', 403);
        }

        /** @var PersonAccessPrimitive $rule */
        $rule = (new PersonAccessPrimitive($this->_db))
            ->setPerson($persons[0])
            ->setAclName($ruleName)
            ->setAclType($ruleType)
            ->setAclValue($ruleValue)
            ->setEventIds([$eventId]);
        $success = $rule->save();
        if (!$success) {
            return null;
        }

        return $rule->getId();
    }

    /**
     * Add new rule for group.
     *
     * @param $ruleName
     * @param $ruleValue
     * @param $ruleType   'bool', 'int' or 'enum'
     * @param $groupId
     * @param $eventId
     * @return int|null Rule id
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function addRuleForGroup($ruleName, $ruleValue, $ruleType, $groupId, $eventId)
    {
        // TODO: check access admin rights here...
        $existingRules = $this->getGroupAccess($groupId, $eventId);
        if (!empty($existingRules[$ruleName])) {
            throw new DuplicateEntityException(
                'Rule ' . $ruleName . ' already exists for group ' . $groupId . ' at event ' . $eventId,
                404
            );
        }

        $groups = GroupPrimitive::findById($this->_db, [$groupId]);
        if (empty($groups)) {
            throw new EntityNotFoundException('Group with id #' . $groupId . ' not found in DB', 405);
        }

        /** @var GroupAccessPrimitive $rule */
        $rule = (new GroupAccessPrimitive($this->_db))
            ->setGroup($groups[0])
            ->setAclName($ruleName)
            ->setAclType($ruleType)
            ->setAclValue($ruleValue)
            ->setEventIds([$eventId]);
        $success = $rule->save();
        if (!$success) {
            return null;
        }

        return $rule->getId();
    }

    /**
     * Update personal rule value and/or type
     *
     * @param $ruleId
     * @param $ruleValue
     * @param $ruleType
     * @return bool   success
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function updateRuleForPerson($ruleId, $ruleValue, $ruleType)
    {
        // TODO: check access admin rights here...
        $rules = PersonAccessPrimitive::findById($this->_db, [$ruleId]);
        if (empty($rules)) {
            throw new EntityNotFoundException('PersonRule with id #' . $ruleId . ' not found in DB', 406);
        }

        return $rules[0]
            ->setAclType($ruleType)
            ->setAclValue($ruleValue)
            ->save();
    }

    /**
     * Update group rule value and/or type
     *
     * @param $ruleId
     * @param $ruleValue
     * @param $ruleType
     * @return bool   success
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function updateRuleForGroup($ruleId, $ruleValue, $ruleType)
    {
        // TODO: check access admin rights here...
        $rules = GroupAccessPrimitive::findById($this->_db, [$ruleId]);
        if (empty($rules)) {
            throw new EntityNotFoundException('GroupRule with id #' . $ruleId . ' not found in DB', 407);
        }

        return $rules[0]
            ->setAclType($ruleType)
            ->setAclValue($ruleValue)
            ->save();
    }

    /**
     * Drop personal rule by id
     *
     * @param $ruleId
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function deleteRuleForPerson($ruleId)
    {
        // TODO: check access admin rights here...
        $rules = PersonAccessPrimitive::findById($this->_db, [$ruleId]);
        if (empty($rules)) {
            throw new EntityNotFoundException('PersonRule with id #' . $ruleId . ' not found in DB', 408);
        }

        $rules[0]->drop();
    }

    /**
     * Drop group rule by id
     *
     * @param $ruleId
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function deleteRuleForGroup($ruleId)
    {
        // TODO: check access admin rights here...
        $rules = GroupAccessPrimitive::findById($this->_db, [$ruleId]);
        if (empty($rules)) {
            throw new EntityNotFoundException('GroupRule with id #' . $ruleId . ' not found in DB', 409);
        }

        $rules[0]->drop();
    }

    /**
     * Clear cache for access rules of person in event.
     * Warning: clearing whole cache is explicitly NOT IMPLEMENTED. When altering groups access rules,
     * it's better to wait for 10mins than cause shitload on DB.
     *
     * @param $personId
     * @param $eventId
     * @return bool
     */
    public function clearAccessCache($personId, $eventId)
    {
        // TODO: check access admin rights here...
        return apcu_delete(Model::_getAccessCacheKey($personId, $eventId));
    }
}
