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
     * @param int $personId
     * @param int $eventId
     * @param string $ruleName
     * @return mixed
     * @throws \Exception
     */
    public function getRuleValue(int $personId, int $eventId, string $ruleName)
    {
        return $this->_getRuleValue($personId, $eventId, $ruleName);
    }

    //////// Admin methods

    /**
     * Client method to receive super-admin flag. Intended to be used only in Mimir/Rheda
     * to determine if used has super-admin privileges independently of any event.
     * Cached for 10 minutes.
     *
     * @param int $personId
     * @return bool
     * @throws \Exception
     */
    public function getSuperadminFlag(int $personId)
    {
        $key = $this->_getAccessCacheKey($personId, '__superadm');
        $flag = apcu_fetch($key);
        if ($flag !== false) {
            return (bool)$flag;
        }

        $persons = PersonPrimitive::findById($this->_db, [$personId]);
        $result = !empty($persons) && $persons[0]->getIsSuperadmin();

        apcu_store($key, $result, self::CACHE_TTL_SEC);
        return $result;
    }

    /**
     * Get all access rules for person grouped by events.
     * - Method results are not cached!
     *
     * @param int $personId
     * @return array
     * @throws \Exception
     */
    public function getAllPersonRules($personId)
    {
        $rules = PersonAccessPrimitive::findByPerson($this->_db, [$personId]);
        $resultingRules = [];
        foreach ($rules as $rule) {
            $eventKey = $rule->getEventId() ?? '__global';
            if (empty($resultingRules[$eventKey])) {
                $resultingRules[$eventKey] = [];
            }
            $resultingRules[$eventKey][$rule->getAclName()] = [
                'id' => $rule->getId(),
                'type' => $rule->getAclType(),
                'value' => $rule->getAclValue(),
                'allowed_values' => $rule->getAllowedValues()
            ];
        }

        return $resultingRules;
    }

    /**
     * Get access rules of specified type for person
     * - Method results are not cached!
     *
     * @param int $personId
     * @param string $type
     * @return array
     * @throws \Exception
     */
    public function getAllPersonRulesOfType($personId, $type)
    {
        $rules = PersonAccessPrimitive::findByPersonAndType($this->_db, [$personId], $type);
        $resultingRules = [];
        foreach ($rules as $rule) {
            $eventKey = $rule->getEventId() ?? '__global';
            if (empty($resultingRules[$eventKey])) {
                $resultingRules[$eventKey] = [];
            }
            $resultingRules[$eventKey] = [
                'id' => $rule->getId(),
                'value' => $rule->getAclValue()
            ];
        }

        return $resultingRules;
    }

    /**
     * Get access rules for group.
     * - Method results are not cached!
     *
     * @param int $groupId
     * @return array
     * @throws \Exception
     */
    public function getAllGroupRules($groupId)
    {
        $rules = GroupAccessPrimitive::findByGroup($this->_db, [$groupId]);
        $resultingRules = [];
        foreach ($rules as $rule) {
            $eventKey = $rule->getEventId() ?? '__global';
            if (empty($resultingRules[$eventKey])) {
                $resultingRules[$eventKey] = [];
            }
            $resultingRules[$eventKey][$rule->getAclName()] = [
                'id' => $rule->getId(),
                'type' => $rule->getAclType(),
                'value' => $rule->getAclValue(),
                'allowed_values' => $rule->getAllowedValues()
            ];
        }

        return $resultingRules;
    }

    /**
     * Get all access rules for event grouped by persons and groups.
     * - Method results are not cached!
     *
     * @param int $eventId
     * @return array
     * @throws \Exception
     */
    public function getAllEventRules($eventId)
    {
        $personRules = PersonAccessPrimitive::findByEvent($this->_db, [$eventId]);
        $groupRules = GroupAccessPrimitive::findByEvent($this->_db, [$eventId]);
        $predicate = function (/** @var PersonAccessPrimitive|GroupAccessPrimitive $rule */ $rule) {
            return [
                'isGlobal' => !$rule->getEventId(),
                'id' => $rule->getId(),
                'type' => $rule->getAclType(),
                'value' => $rule->getAclValue(),
                'name' => $rule->getAclName(),
                'ownerTitle' => $rule instanceof PersonAccessPrimitive // TODO: db query inside loop, can be improved
                    ? $rule->getPerson()->getTitle()
                    : $rule->getGroup()->getTitle(),
                'allowed_values' => $rule->getAllowedValues()
            ];
        };

        return [
            'person' => array_map($predicate, $personRules),
            'group' => array_map($predicate, $groupRules)
        ];
    }

    /**
     * @param int $eventId
     * @return array
     */
    public function getEventAdmins($eventId)
    {
        $personRules = PersonAccessPrimitive::findByEvent($this->_db, [$eventId]);
        $admins = array_filter($personRules, function ($rule) {
            return $rule->getAclName() === AccessRules::ADMIN_EVENT;
        });
        return array_map(function ($rule) {
            return [
                'rule_id' => $rule->getId(),
                'id' => $rule->getPersonId(),
                'name' => $rule->getPerson()->getTitle()
            ];
        }, $admins);
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
        $rules = $this->_getPersonAccessRules($personId, $eventId);
        /** @var PersonAccessPrimitive[] $eventRelatedRules */
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
        $rules = $this->_getGroupAccessRules([$groupId], $eventId);
        /** @var GroupAccessPrimitive[] $eventRelatedRules */
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
     * @param string $ruleName
     * @param bool|int|string $ruleValue
     * @param string $ruleType 'bool', 'int' or 'enum'
     * @param int $personId
     * @param int|null $eventId
     *
     * @return int|null
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function addRuleForPerson(string $ruleName, $ruleValue, string $ruleType, int $personId, ?int $eventId)
    {
        // TODO: check again; looks like this should not be here.
//        if (InternalRules::isInternal($ruleName)) {
//            throw new InvalidParametersException('Rule name ' . $ruleName . ' is reserved for internal use');
//        }

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
     * @param string $ruleName
     * @param bool|int|string $ruleValue
     * @param string $ruleType 'bool', 'int' or 'enum'
     * @param int $groupId
     * @param int|null $eventId
     *
     * @return int|null
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function addRuleForGroup(string $ruleName, $ruleValue, string $ruleType, int $groupId, ?int $eventId)
    {
        // TODO: check again; looks like this should not be here.
//        if (InternalRules::isInternal($ruleName)) {
//            throw new InvalidParametersException('Rule name ' . $ruleName . ' is reserved for internal use');
//        }

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
     * @param string $ruleName
     * @param bool|int|string $ruleValue
     * @param string $ruleType 'bool', 'int' or 'enum'
     * @param int $personId
     *
     * @return int|null
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function addSystemWideRuleForPerson(string $ruleName, $ruleValue, string $ruleType, int $personId)
    {
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
     * @param string $ruleName
     * @param bool|int|string $ruleValue
     * @param string $ruleType 'bool', 'int' or 'enum'
     * @param int $groupId
     *
     * @return int|null
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function addSystemWideRuleForGroup(string $ruleName, $ruleValue, string $ruleType, int $groupId)
    {
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
     * @param int $ruleId
     * @param bool|int|string $ruleValue
     * @param string $ruleType
     *
     * @return bool
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function updateRuleForPerson(int $ruleId, $ruleValue, string $ruleType)
    {
        /** @var PersonAccessPrimitive[] $rules */
        $rules = PersonAccessPrimitive::findById($this->_db, [$ruleId]);
        if (empty($rules)) {
            throw new EntityNotFoundException('PersonRule with id #' . $ruleId . ' not found in DB', 406);
        }

        if (empty($rules[0]->getEventId())) { // systemwide
            $this->_checkAccessRights(InternalRules::UPDATE_RULE_FOR_PERSON);
        } else {
            $this->_checkAccessRights(InternalRules::UPDATE_RULE_FOR_PERSON, $rules[0]->getEventId());
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
     * Update group rule value and/or type
     *
     * @param int $ruleId
     * @param bool|int|string $ruleValue
     * @param string $ruleType
     *
     * @return bool
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function updateRuleForGroup(int $ruleId, $ruleValue, string $ruleType)
    {
        $rules = GroupAccessPrimitive::findById($this->_db, [$ruleId]);
        if (empty($rules)) {
            throw new EntityNotFoundException('GroupRule with id #' . $ruleId . ' not found in DB', 407);
        }

        if (empty($rules[0]->getEventId())) { // systemwide
            $this->_checkAccessRights(InternalRules::UPDATE_RULE_FOR_GROUP);
        } else {
            $this->_checkAccessRights(InternalRules::UPDATE_RULE_FOR_GROUP, $rules[0]->getEventId());
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
     * @param int $ruleId
     *
     * @throws EntityNotFoundException
     * @throws \Exception
     *
     * @return void
     */
    public function deleteRuleForPerson(int $ruleId): void
    {
        /** @var PersonAccessPrimitive[] $rules */
        $rules = PersonAccessPrimitive::findById($this->_db, [$ruleId]);
        if (empty($rules)) {
            throw new EntityNotFoundException('PersonRule with id #' . $ruleId . ' not found in DB', 408);
        }

        if (empty($rules[0]->getEventId())) { // systemwide
            $this->_checkAccessRights(InternalRules::DELETE_RULE_FOR_PERSON);
        } else {
            $this->_checkAccessRights(InternalRules::DELETE_RULE_FOR_PERSON, $rules[0]->getEventId());
        }

        // TODO: check again; looks like this should not be here.
//        if (InternalRules::isInternal($rules[0]->getAclName())) {
//            throw new InvalidParametersException('Rule name ' . $rules[0]->getAclName()
//                . ' is reserved for internal use, so it can not be deleted');
//        }

        $rules[0]->drop();
    }

    /**
     * Drop group rule by id
     *
     * @param int $ruleId
     *
     * @throws EntityNotFoundException
     * @throws \Exception
     *
     * @return void
     */
    public function deleteRuleForGroup(int $ruleId): void
    {
        $rules = GroupAccessPrimitive::findById($this->_db, [$ruleId]);
        if (empty($rules)) {
            throw new EntityNotFoundException('GroupRule with id #' . $ruleId . ' not found in DB', 409);
        }

        if (empty($rules[0]->getEventId())) { // systemwide
            $this->_checkAccessRights(InternalRules::DELETE_RULE_FOR_GROUP);
        } else {
            $this->_checkAccessRights(InternalRules::DELETE_RULE_FOR_GROUP, $rules[0]->getEventId());
        }

        // TODO: check again; looks like this should not be here.
//        if (InternalRules::isInternal($rules[0]->getAclName())) {
//            throw new InvalidParametersException('Rule name ' . $rules[0]->getAclName()
//                . ' is reserved for internal use, so it can not be deleted');
//        }

        $rules[0]->drop();
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
    public function clearAccessCache(int $personId, int $eventId)
    {
        return (bool)apcu_delete(Model::_getAccessCacheKey($personId, (string)$eventId));
    }
}
