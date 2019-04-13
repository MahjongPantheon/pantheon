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
require_once __DIR__ . '/../helpers/InternalRules.php';
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
     * Get all access rules for person grouped by events. Method results are not cached!
     *
     * @param int $personId
     * @return array
     * @throws \Exception
     */
    public function getAllPersonRules($personId)
    {
        $this->_checkAccessRights(InternalRules::GET_ALL_PERSON_RULES);

        $rules = PersonAccessPrimitive::findByPerson($this->_db, [$personId]);
        $resultingRules = [];
        foreach ($rules as $rule) {
            $eventKey = $rule->getEventId() ?? '__global';
            if (empty($resultingRules[$eventKey])) {
                $resultingRules[$eventKey] = [];
            }
            $resultingRules[$eventKey][$rule->getAclName()] = $rule->getAclValue();
        }

        return $resultingRules;
    }

    /**
     * Get access rules for group.
     * - eventId may be null to get system-wide rules.
     * - Method results are not cached!
     *
     * @param int $groupId
     * @return array
     * @throws \Exception
     */
    public function getAllGroupRules($groupId)
    {
        $this->_checkAccessRights(InternalRules::GET_ALL_GROUP_RULES);

        $rules = GroupAccessPrimitive::findByGroup($this->_db, [$groupId]);
        $resultingRules = [];
        foreach ($rules as $rule) {
            $eventKey = $rule->getEventId() ?? '__global';
            if (empty($resultingRules[$eventKey])) {
                $resultingRules[$eventKey] = [];
            }
            $resultingRules[$eventKey][$rule->getAclName()] = $rule->getAclValue();
        }

        return $resultingRules;
    }

    /**
     * Get access rules for person.
     * - eventId may be null to get system-wide rules.
     * - Method results are not cached!
     *
     * @param int $personId
     * @param int|null $eventId
     * @return array
     * @throws \Exception
     */
    public function getPersonAccess($personId, $eventId)
    {
        $this->_checkAccessRights(InternalRules::GET_PERSON_ACCESS, $eventId);

        $rules = $this->_getPersonAccessRules($personId, $eventId);
        $eventRelatedRules = array_filter($rules, function (PersonAccessPrimitive $rule) use ($eventId) {
            if (empty($eventId)) { // required to get system-wide rules
                return true;
            }
            return !empty($rule->getEventId());
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
     * @param int $groupId
     * @param int|null $eventId
     * @return array
     * @throws \Exception
     */
    public function getGroupAccess($groupId, $eventId)
    {
        $this->_checkAccessRights(InternalRules::GET_GROUP_ACCESS, $eventId);

        $rules = $this->_getGroupAccessRules([$groupId], $eventId);
        $eventRelatedRules = array_filter($rules, function (GroupAccessPrimitive $rule) use ($eventId) {
            if (empty($eventId)) { // required to get system-wide rules
                return true;
            }
            return !empty($rule->getEventId());
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
        $this->_checkAccessRights(InternalRules::ADD_RULE_FOR_PERSON, $eventId);

        if (InternalRules::isInternal($ruleName)) {
            throw new InvalidParametersException('Rule name ' . $ruleName . ' is reserved for internal use');
        }

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
            ->setEventId($eventId);
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
        $this->_checkAccessRights(InternalRules::ADD_RULE_FOR_GROUP, $eventId);

        if (InternalRules::isInternal($ruleName)) {
            throw new InvalidParametersException('Rule name ' . $ruleName . ' is reserved for internal use');
        }

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
            ->setEventId($eventId);
        $success = $rule->save();
        if (!$success) {
            return null;
        }

        return $rule->getId();
    }

    /**
     * Add new system-wide rule for a person.
     *
     * @param $ruleName
     * @param $ruleValue
     * @param $ruleType   'bool', 'int' or 'enum'
     * @param $personId
     * @return int|null Rule id
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function addSystemWideRuleForPerson($ruleName, $ruleValue, $ruleType, $personId)
    {
        $this->_checkAccessRights(InternalRules::ADD_SYSTEM_WIDE_RULE_FOR_PERSON);

        if (InternalRules::isInternal($ruleName)) {
            $ruleType = AccessPrimitive::TYPE_BOOL; // Internal rules are always boolean
        }

        $existingRules = $this->getPersonAccess($personId, null);
        if (!empty($existingRules[$ruleName])) {
            throw new DuplicateEntityException(
                'System-wide rule ' . $ruleName . ' already exists for person ' . $personId,
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
            ->setAclValue($ruleValue);
        $success = $rule->save();
        if (!$success) {
            return null;
        }

        return $rule->getId();
    }

    /**
     * Add new system-wide rule for group.
     *
     * @param $ruleName
     * @param $ruleValue
     * @param $ruleType   'bool', 'int' or 'enum'
     * @param $groupId
     * @return int|null Rule id
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function addSystemWideRuleForGroup($ruleName, $ruleValue, $ruleType, $groupId)
    {
        $this->_checkAccessRights(InternalRules::ADD_SYSTEM_WIDE_RULE_FOR_GROUP);

        if (InternalRules::isInternal($ruleName)) {
            $ruleType = AccessPrimitive::TYPE_BOOL; // Internal rules are always boolean
        }

        $existingRules = $this->getGroupAccess($groupId, null);
        if (!empty($existingRules[$ruleName])) {
            throw new DuplicateEntityException(
                'System-wide rule ' . $ruleName . ' already exists for group ' . $groupId,
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
            ->setAclValue($ruleValue);
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
        /** @var PersonAccessPrimitive[] $rules */
        $rules = PersonAccessPrimitive::findById($this->_db, [$ruleId]);
        if (empty($rules)) {
            throw new EntityNotFoundException('PersonRule with id #' . $ruleId . ' not found in DB', 406);
        }

        if (empty($rules[0]->getEventId())) { // systemwide
            $this->_checkAccessRights(InternalRules::UPDATE_RULE_FOR_PERSON);
        } else {
            $this->_checkAccessRights(InternalRules::UPDATE_RULE_FOR_PERSON, $rules[0]->getEventId()[0]);
        }

        if (InternalRules::isInternal($rules[0]->getAclName()) && $ruleType != $rules[0]->getAclType()) {
            throw new InvalidParametersException('Rule name ' . $rules[0]->getAclName()
                . ' is reserved for internal use, so it\'s type can not be changed');
        }

        if (InternalRules::isInternal($rules[0]->getAclName()) && in_array($rules[0]->getPersonId(), $this->_superAdminIds)) {
            throw new InvalidParametersException('Rule name ' . $rules[0]->getAclName()
                . ' is reserved for internal use and it\'s value can not be changed for super admin user');
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
        $rules = GroupAccessPrimitive::findById($this->_db, [$ruleId]);
        if (empty($rules)) {
            throw new EntityNotFoundException('GroupRule with id #' . $ruleId . ' not found in DB', 407);
        }

        if (empty($rules[0]->getEventId())) { // systemwide
            $this->_checkAccessRights(InternalRules::UPDATE_RULE_FOR_GROUP);
        } else {
            $this->_checkAccessRights(InternalRules::UPDATE_RULE_FOR_GROUP, $rules[0]->getEventId()[0]);
        }

        if (InternalRules::isInternal($rules[0]->getAclName()) && $ruleType != $rules[0]->getAclType()) {
            throw new InvalidParametersException('Rule name ' . $rules[0]->getAclName()
                . ' is reserved for internal use, so it\'s type can not be changed');
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
        /** @var PersonAccessPrimitive[] $rules */
        $rules = PersonAccessPrimitive::findById($this->_db, [$ruleId]);
        if (empty($rules)) {
            throw new EntityNotFoundException('PersonRule with id #' . $ruleId . ' not found in DB', 408);
        }

        if (empty($rules[0]->getEventId())) { // systemwide
            $this->_checkAccessRights(InternalRules::DELETE_RULE_FOR_PERSON);
        } else {
            $this->_checkAccessRights(InternalRules::DELETE_RULE_FOR_PERSON, $rules[0]->getEventId()[0]);
        }

        if (InternalRules::isInternal($rules[0]->getAclName())) {
            throw new InvalidParametersException('Rule name ' . $rules[0]->getAclName()
                . ' is reserved for internal use, so it can not be deleted');
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
        $rules = GroupAccessPrimitive::findById($this->_db, [$ruleId]);
        if (empty($rules)) {
            throw new EntityNotFoundException('GroupRule with id #' . $ruleId . ' not found in DB', 409);
        }

        if (empty($rules[0]->getEventId())) { // systemwide
            $this->_checkAccessRights(InternalRules::DELETE_RULE_FOR_GROUP);
        } else {
            $this->_checkAccessRights(InternalRules::DELETE_RULE_FOR_GROUP, $rules[0]->getEventId()[0]);
        }

        if (InternalRules::isInternal($rules[0]->getAclName())) {
            throw new InvalidParametersException('Rule name ' . $rules[0]->getAclName()
                . ' is reserved for internal use, so it can not be deleted');
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
     * @throws \Exception
     */
    public function clearAccessCache($personId, $eventId)
    {
        $this->_checkAccessRights(InternalRules::CLEAR_ACCESS_CACHE, $eventId);
        return apcu_delete(Model::_getAccessCacheKey($personId, $eventId));
    }
}
