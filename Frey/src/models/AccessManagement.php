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
    const CACHE_TTL_SEC = 10 * 60;

    //////// Client usage methods (non-admin)

    /**
     * Primary client method, aggregating rules from groups and person.
     * Get array of access rules for person in event.
     * Cached for 10 minutes.
     *
     * @param int $personId
     * @param int $eventId
     * @return array|mixed
     * @throws \Exception
     */
    public function getAccessRules(int $personId, int $eventId)
    {
        $rules = apcu_fetch($this->_getAccessCacheKey($personId, $eventId));
        if ($rules !== false) {
            return $rules;
        }

        $persons = PersonPrimitive::findById($this->_db, [$personId]);
        if (empty($persons)) {
            throw new \Exception('Person with id #' . $personId . ' not found in DB');
        }

        /** @var PersonAccessPrimitive[] $personRules */
        $personRules = array_filter(
            PersonAccessPrimitive::findByPerson($this->_db, [$personId]),
            function (PersonAccessPrimitive $rule) use ($eventId) {
                return empty($rule->getEventsId()) // system-wide person rules
                    || in_array($eventId, $rule->getEventsId());
            }
        );
        /** @var GroupAccessPrimitive[] $groupRules */
        $groupRules = array_filter(
            GroupAccessPrimitive::findByGroup($this->_db, $persons[0]->getGroupIds()),
            function (GroupAccessPrimitive $rule) use ($eventId) {
                return empty($rule->getEventsId()) // system-wide group rules
                    || in_array($eventId, $rule->getEventsId());
            }
        );

        $resultingRules = [];
        foreach ($groupRules as $rule) {
            $resultingRules[$rule->getAclName()] = $rule->getAclValue();
        }
        foreach ($personRules as $rule) { // Person rules have higher priority than group rules
            $resultingRules[$rule->getAclName()] = $rule->getAclValue();
        }

        apcu_store($this->_getAccessCacheKey($personId, $eventId), $resultingRules, self::CACHE_TTL_SEC);
        return $resultingRules;
    }

    /**
     * Get single rule for person in event. Hardly relies on cache.
     * Typically should not be used when more than one value should be retrieved.
     *
     * @param $personId
     * @param $eventId
     * @param $ruleName
     * @return mixed
     * @throws \Exception
     */
    public function getRuleValue($personId, $eventId, $ruleName)
    {
        return $this->getAccessRules($personId, $eventId)[$ruleName];
    }

    //////// Admin methods

    public function getPersonAccess($personId, $eventId)
    {

    }

    public function getGroupAccess($groupId, $eventId)
    {

    }

    public function addRuleForPerson($ruleName, $ruleValue, $ruleType, $personId, $eventId)
    {

    }

    public function addRuleForGroup($ruleName, $ruleValue, $ruleType, $personId, $eventId)
    {

    }

    public function updateRuleForPerson($ruleId, $ruleValue, $ruleType)
    {

    }

    public function updateRuleForGroup($ruleId, $ruleValue, $ruleType)
    {

    }

    public function deleteRuleForPerson($ruleId)
    {

    }

    public function deleteRuleForGroup($ruleId)
    {

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
        return apcu_delete($this->_getAccessCacheKey($personId, $eventId));
    }

    /**
     * Get apcu cache key for access rules
     *
     * @param $personId
     * @param $eventId
     * @return string
     */
    protected function _getAccessCacheKey($personId, $eventId)
    {
        return "access_${personId}_${eventId}";
    }
}
