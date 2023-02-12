<?php

namespace Mimir;

use Common\RuleListItemEx;
use Common\RuleValue;

require_once __DIR__ . '/HttpClient.php';
require_once __DIR__ . '/interfaces/IFreyClient.php';

/**
 * Class FreyClient
 *
 * @package Mimir */
class FreyClientTwirp implements IFreyClient
{
    /**
    * @var \Common\FreyClient
    */
    protected $_client;

    public function __construct(string $apiUrl)
    {
        $this->_client = new \Common\FreyClient(
            $apiUrl,
            $httpClient = null,
            null,
            null,
            '/v2'
        );
    }

    protected static function _fromRuleValue(\Common\RuleValue | null $value)
    {
        if (empty($value)) {
            return null;
        }
        if ($value->hasBoolValue()) {
            return $value->getBoolValue();
        }
        if ($value->hasNumberValue()) {
            return $value->getNumberValue();
        }
        return $value->getStringValue();
    }

    protected static function _toRuleValue(&$value): \Common\RuleValue
    {
        if (is_bool($value)) {
            return (new \Common\RuleValue())->setBoolValue($value);
        } elseif (is_integer($value)) {
            return (new \Common\RuleValue())->setNumberValue($value);
        } else {
            return (new \Common\RuleValue())->setStringValue($value);
        }
    }

    /**
     * @return \Common\FreyClient
     */
    public function getClient()
    {
        return $this->_client;
    }

    /**
     *  Request new registration with given email and password.
     *  Approval code is returned. It is intended to be sent to provided email address.
     *
     * @param string $email
     * @param string $password
     * @return string
    */
    public function requestRegistration(string $email, string $password): string
    {
        return $this->_client->RequestRegistration(
            [],
            (new \Common\Auth_RequestRegistration_Payload())
                ->setEmail($email)
                ->setPassword($password)
        )->getApprovalCode();
    }

    /**
     *  Approve registration with approval code.
     *  Returns new person's ID on success.
     *
     * @param string $approvalCode
     * @return int
    */
    public function approveRegistration(string $approvalCode): int
    {
        return $this->_client->ApproveRegistration(
            [],
            (new \Common\Auth_ApproveRegistration_Payload())
                ->setApprovalCode($approvalCode)
        )->getPersonId();
    }

    /**
     *  Authorize person ant return permanent client-side auth token.
     *
     * @param string $email
     * @param string $password
     * @return array
    */
    public function authorize(string $email, string $password): array
    {
        $ret = $this->_client->Authorize(
            [],
            (new \Common\Auth_Authorize_Payload())
                ->setEmail($email)
                ->setPassword($password)
        );
        return [$ret->getPersonId(), $ret->getAuthToken()];
    }

    /**
     *  Check if client-side token matches stored password hash.
     *  Useful for cookie-check.
     *
     * @param int $id
     * @param string $clientSideToken
     * @return bool
    */
    public function quickAuthorize(int $id, string $clientSideToken): bool
    {
        return $this->_client->QuickAuthorize(
            [],
            (new \Common\Auth_QuickAuthorize_Payload())
                ->setPersonId($id)
                ->setAuthToken($clientSideToken)
        )->getAuthSuccess();
    }

    /**
     *  Change password when old password is known.
     *  Returns new client-side auth token on success
     *
     * @param string $email
     * @param string $password
     * @param string $newPassword
     * @return string
    */
    public function changePassword(string $email, string $password, string $newPassword): string
    {
        return $this->_client->ChangePassword(
            [],
            (new \Common\Auth_ChangePassword_Payload())
                ->setEmail($email)
                ->setPassword($password)
                ->setNewPassword($newPassword)
        )->getAuthToken();
    }

    /**
     *  Request password reset.
     *  Returns reset approval token, which should be sent over email to user.
     *
     * @param string $email
     * @return string
    */
    public function requestResetPassword(string $email): string
    {
        return $this->_client->RequestResetPassword(
            [],
            (new \Common\Auth_RequestResetPassword_Payload())
                ->setEmail($email)
        )->getResetToken();
    }

    /**
     *  Approve password reset.
     *  Generates digit-code and uses it as a new password, updates all records
     *  and returns the code. Code should be sent to person via email, and person
     *  should be asked to change the password immediately.
     *
     *
     *
     * @param string $email
     * @param string $resetApprovalCode
     * @return string
    */
    public function approveResetPassword(string $email, string $resetApprovalCode): string
    {
        return $this->_client->ApproveResetPassword(
            [],
            (new \Common\Auth_ApproveResetPassword_Payload())
                ->setEmail($email)
                ->setResetToken($resetApprovalCode)
        )->getNewTmpPassword();
    }

    /**
     *  Primary client method, aggregating rules from groups and person.
     *  Get array of access rules for person in event.
     *  Cached for 10 minutes.
     *
     * @param int $personId
     * @param int $eventId
     * @return array
    */
    public function getAccessRules(int $personId, int $eventId): array
    {
        $ret = $this->_client->GetAccessRules(
            [],
            (new \Common\Access_GetAccessRules_Payload())
                ->setPersonId($personId)
                ->setEventId($eventId)
        )->getRules();

        $rules = [];
        foreach ($ret->getRules()->getIterator() as $k => $v) {
            $rules[$k] = self::_fromRuleValue($v);
        }

        return $rules;
    }

    /**
     *  Get single rule for person in event. Hardly relies on cache.
     *  Also counts group rules if person belongs to one or more groups.
     *  Typically should not be used when more than one value should be retrieved.
     *  Returns null if no data found for provided person/event ids or rule name.
     *
     * @param int $personId
     * @param int $eventId
     * @param string $ruleName
     * @return mixed
    */
    public function getRuleValue(int $personId, int $eventId, string $ruleName)
    {
        return self::_fromRuleValue($this->_client->GetRuleValue(
            [],
            (new \Common\Access_GetRuleValue_Payload())
                ->setPersonId($personId)
                ->setEventId($eventId)
                ->setRuleName($ruleName)
        )->getValue());
    }

    /**
     * @param string $id
     * @param string $title
     * @param string $country
     * @param string $city
     * @param string $email
     * @param string $phone
     * @param string $tenhouId
     * @return bool
    */
    public function updatePersonalInfo(string $id, string $title, string $country, string $city, string $email, string $phone, string $tenhouId): bool
    {
        return $this->_client->UpdatePersonalInfo(
            [],
            (new \Common\Persons_UpdatePersonalInfo_Payload())
                ->setId($id)
                ->setTitle($title)
                ->setCountry($country)
                ->setCity($city)
                ->setEmail($email)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getSuccess();
    }

    /**
     *  Get personal info by id list.
     *  May or may not include private data (depending on admin rights of requesting user).
     *
     * @param array $ids
     * @return array
    */
    public function getPersonalInfo(array $ids): array
    {
        $persons = $this->_client->GetPersonalInfo(
            [],
            (new \Common\Persons_GetPersonalInfo_Payload())
                ->setIds($ids)
        )->getPersons()->getIterator();

        return array_map(function(\Common\PersonEx $person) {
            return [
                'id' => $person->getId(),
                'country' => $person->getCountry(),
                'city' => $person->getCity(),
                'email' => $person->getEmail(),
                'phone' => $person->getPhone(),
                'tenhou_id' => $person->getTenhouId(),
                'groups' => $person->getGroupIds(),
                'title' => $person->getTitle(),
            ];
        }, iterator_to_array($persons));
    }

    /**
     *  Get personal info by tenhou id list.
     *  May or may not include private data (depending on admin rights of requesting user).
     *
     * @param array $ids
     * @return array
    */
    public function findByTenhouIds(array $ids): array
    {
        $persons = $this->_client->FindByTenhouIds(
            [],
            (new \Common\Persons_FindByTenhouIds_Payload())
                ->setIds($ids)
        )->getPersons()->getIterator();

        return array_map(function(\Common\PersonEx $person) {
            return [
                'id' => $person->getId(),
                'country' => $person->getCountry(),
                'city' => $person->getCity(),
                'email' => $person->getEmail(),
                'phone' => $person->getPhone(),
                'tenhou_id' => $person->getTenhouId(),
                'groups' => $person->getGroupIds(),
                'title' => $person->getTitle(),
            ];
        }, iterator_to_array($persons));
    }

    /**
     *  Fuzzy search by title.
     *  Query should 3 or more characters long.
     *
     * @param string $query
     * @return array
    */
    public function findByTitle(string $query): array
    {
        $persons = $this->_client->FindByTitle(
            [],
            (new \Common\Persons_FindByTitle_Payload())
                ->setQuery($query)
        )->getPersons();

        return array_map(function(\Common\Person $person) {
            return [
                'id' => $person->getId(),
                'city' => $person->getCity(),
                'tenhou_id' => $person->getTenhouId(),
                'title' => $person->getTitle(),
            ];
        }, iterator_to_array($persons));
    }

    /**
     *  Get info of groups by id list
     *
     * @param array $ids
     * @return array
    */
    public function getGroups(array $ids): array
    {
        $groups = $this->_client->GetGroups(
            [],
            (new \Common\Persons_GetGroups_Payload())
                ->setIds($ids)
        )->getGroups();

        return array_map(function(\Common\Group $group) {
            return [
                'id' => $group->getId(),
                'title' => $group->getTitle(),
                'label_color' => $group->getColor(),
                'description' => $group->getDescription(),
            ];
        }, iterator_to_array($groups));
    }

    /**
     *  Get all event admins
     *  Format: [[rule_id => int, id => int, name => string], ...]
     *
     * @param int $eventId
     * @return array
    */
    public function getEventAdmins(int $eventId): array
    {
        $rules = $this->_client->GetEventAdmins(
            [],
            (new \Common\Access_GetEventAdmins_Payload())
                ->setEventId($eventId)
        )->getAdmins()->getIterator();

        return array_map(function (\Common\EventAdmin $rule) {
            return [
                'rule_id' => $rule->getRuleId(),
                'id' => $rule->getPersonId(),
                'name' => $rule->getPersonName()
            ];
        }, iterator_to_array($rules));
    }

    /**
     *  Client method to receive super-admin flag. Intended to be used only in Mimir/Rheda
     *  to determine if used has super-admin privileges independently of any event.
     *  Cached for 10 minutes.
     *
     * @param int $personId
     * @return bool
    */
    public function getSuperadminFlag(int $personId): bool
    {
        return $this->_client->GetSuperadminFlag(
            [],
            (new \Common\Access_GetSuperadminFlag_Payload())
                ->setPersonId($personId)
        )->getIsAdmin();
    }

    /**
     *  Get list of event IDs where specified person has admin privileges.
     *
     * @param int $personId
     * @return array
    */
    public function getOwnedEventIds(int $personId): array
    {
        return iterator_to_array($this->_client->GetOwnedEventIds(
            [],
            (new \Common\Access_GetOwnedEventIds_Payload())
                ->setPersonId($personId)
        )->getEventIds()->getIterator());
    }

    /**
     *  Get rule list with translations to selected locale
     *
     * @return array
    */
    public function getRulesList(): array
    {
        $rules = $this->_client->GetRulesList(
            [],
            (new \Common\Access_GetRulesList_Payload())
        )->getItems()->getIterator();

        return array_map(function (\Common\RuleListItem $rule) {
            return [
                'default' => $rule->getDefault(),
                'type' => $rule->getType(),
                'title' => $rule->getTitle(),
            ];
        }, iterator_to_array($rules));
    }

    /**
     *  Get all access rules for event.
     *  - Method results are not cached!
     *  - To be used in admin panel, but not in client side!
     *
     * @param int $eventId
     * @return array
    */
    public function getAllEventRules(int $eventId): array
    {
        $ret = $this->_client->GetAllEventRules(
            [],
            (new \Common\Access_GetAllEventRules_Payload())
        );
        $retGroup = iterator_to_array($ret->getGroupRules()->getIterator());
        $retPerson = iterator_to_array($ret->getPersonRules()->getIterator());
        $predicate = function (\Common\EventRuleListItem $rule) {
            return [
                'isGlobal' => $rule->getIsGlobal(),
                'id' => $rule->getId(),
                'type' => is_bool($rule->getValue()) ? 'bool' : (is_integer($rule->getValue()) ? 'number' : 'string'),
                'value' => $rule->getValue(),
                'name' => $rule->getName(),
                'ownerTitle' => $rule->getOwnerTitle(),
                'allowed_values' => iterator_to_array($rule->getAllowedValues()->getIterator())
            ];
        };

        return [
            'person' => array_map($predicate, $retPerson),
            'group' => array_map($predicate, $retGroup)
        ];
    }

    /**
     *  Get access rules for person.
     *  - eventId may be null to get system-wide rules.
     *  - Method results are not cached!
     *  - To be used in admin panel, but not in client side!
     *  - Does not output superadmin flag
     *
     * @param int $personId
     * @param int|null $eventId
     * @return array
    */
    public function getPersonAccess(int $personId, $eventId): array
    {
        $ret = $this->_client->GetPersonAccess(
            [],
            (new \Common\Access_GetPersonAccess_Payload())
                ->setPersonId($personId)
                ->setEventId($eventId)
        )->getRules();

        $rules = [];
        foreach ($ret->getRules()->getIterator() as $k => $v) {
            $rules[$k] = self::_fromRuleValue($v);
        }

        return $rules;
    }

    /**
     *  Get access rules for group.
     *  - eventId may be null to get system-wide rules.
     *  - Method results are not cached!
     *  - To be used in admin panel, but not in client side!
     *  - Does not output superadmin flag
     *
     * @param int $groupId
     * @param int|null $eventId
     * @return array
    */
    public function getGroupAccess(int $groupId, $eventId): array
    {
        $ret = $this->_client->GetGroupAccess(
            [],
            (new \Common\Access_GetGroupAccess_Payload())
                ->setGroupId($groupId)
                ->setEventId($eventId)
        )->getRules();

        $rules = [];
        foreach ($ret->getRules()->getIterator() as $k => $v) {
            $rules[$k] = self::_fromRuleValue($v);
        }

        return $rules;
    }

    /**
     *  Get all access rules for person.
     *  - Method results are not cached!
     *  - To be used in admin panel, but not in client side!
     *
     * @param int $personId
     * @return array
    */
    public function getAllPersonAccess(int $personId): array
    {
        $map = $this->_client->GetAllPersonAccess(
            [],
            (new \Common\Access_GetAllPersonAccess_Payload())
                ->setPersonId($personId)
        )->getRulesByEvent()->getIterator();

        $ret = [];
        foreach ($map as $eventId => $access) {
            $ret[$eventId] = [];
            /** @var RuleListItemEx $data */
            foreach ($access as $ruleName => $data) {
                $ret[$eventId][$ruleName] = [
                    'id' => $data->getId(),
                    'type' => $data->getType(),
                    'value' => self::_fromRuleValue($data->getValue()),
                    'allowed_values' => $data->getAllowedValues()
                ];
            }
        }

        return $ret;
    }

    /**
     *  Get all access rules for group.
     *  - Method results are not cached!
     *  - To be used in admin panel, but not in client side!
     *
     * @param int $groupId
     * @return array
    */
    public function getAllGroupAccess(int $groupId): array
    {
        $map = $this->_client->GetAllGroupAccess(
            [],
            (new \Common\Access_GetAllGroupAccess_Payload())
                ->setGroupId($groupId)
        )->getRulesByEvent()->getIterator();

        $ret = [];
        foreach ($map as $eventId => $access) {
            $ret[$eventId] = [];
            /** @var RuleListItemEx $data */
            foreach ($access as $ruleName => $data) {
                $ret[$eventId][$ruleName] = [
                    'id' => $data->getId(),
                    'type' => $data->getType(),
                    'value' => self::_fromRuleValue($data->getValue()),
                    'allowed_values' => $data->getAllowedValues()
                ];
            }
        }

        return $ret;
    }

    /**
     *  Add new rule for a person.
     *
     *
     *
     * @param string $ruleName
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @param int $personId
     * @param int $eventId
     * @return int|null
    */
    public function addRuleForPerson(string $ruleName, $ruleValue, string $ruleType, int $personId, int $eventId)
    {
        return $this->_client->AddRuleForPerson(
            [],
            (new \Common\Access_AddRuleForPerson_Payload())
                ->setRuleName($ruleName)
                ->setRuleValue(self::_toRuleValue($ruleValue))
                ->setRuleType($ruleType)
                ->setPersonId($personId)
                ->setEventId($eventId)
        )->getRuleId();
    }

    /**
     *  Add new rule for a group.
     *
     *
     *
     * @param string $ruleName
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @param int $groupId
     * @param int $eventId
     * @return int|null
    */
    public function addRuleForGroup(string $ruleName, $ruleValue, string $ruleType, int $groupId, int $eventId)
    {
        return $this->_client->AddRuleForGroup(
            [],
            (new \Common\Access_AddRuleForGroup_Payload())
                ->setRuleName($ruleName)
                ->setRuleValue(self::_toRuleValue($ruleValue))
                ->setRuleType($ruleType)
                ->setGroupId($groupId)
                ->setEventId($eventId)
        )->getRuleId();
    }

    /**
     *  Update personal rule value and/or type
     *
     * @param int $ruleId
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @return bool
    */
    public function updateRuleForPerson(int $ruleId, $ruleValue, string $ruleType): bool
    {
        return $this->_client->UpdateRuleForPerson(
            [],
            (new \Common\Access_UpdateRuleForPerson_Payload())
                ->setRuleId($ruleId)
                ->setRuleValue(self::_toRuleValue($ruleValue))
                ->setRuleType($ruleType)
        )->getSuccess();
    }

    /**
     *  Update group rule value and/or type
     *
     * @param int $ruleId
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @return bool
    */
    public function updateRuleForGroup(int $ruleId, $ruleValue, string $ruleType): bool
    {
        return $this->_client->UpdateRuleForGroup(
            [],
            (new \Common\Access_UpdateRuleForGroup_Payload())
                ->setRuleId($ruleId)
                ->setRuleValue(self::_toRuleValue($ruleValue))
                ->setRuleType($ruleType)
        )->getSuccess();
    }

    /**
     *  Drop personal rule by id
     *
     * @param int $ruleId
     * @return bool
    */
    public function deleteRuleForPerson(int $ruleId): bool
    {
        return $this->_client->DeleteRuleForPerson(
            [],
            (new \Common\Access_DeleteRuleForPerson_Payload())
                ->setRuleId($ruleId)
        )->getSuccess();
    }

    /**
     *  Drop group rule by id
     *
     * @param int $ruleId
     * @return bool
    */
    public function deleteRuleForGroup(int $ruleId): bool
    {
        return $this->_client->DeleteRuleForGroup(
            [],
            (new \Common\Access_DeleteRuleForGroup_Payload())
                ->setRuleId($ruleId)
        )->getSuccess();
    }

    /**
     *  Clear cache for access rules of person in event.
     *  Warning: clearing whole cache is explicitly NOT IMPLEMENTED. When altering groups access rules,
     *  it's better to wait for 10mins than cause shitload on DB.
     *
     * @param int $personId
     * @param int $eventId
     * @return bool
    */
    public function clearAccessCache(int $personId, int $eventId): bool
    {
        return $this->_client->ClearAccessCache(
            [],
            (new \Common\Access_ClearAccessCache_Payload())
                ->setPersonId($personId)
                ->setEventId($eventId)
        )->getSuccess();
    }

    /**
     *  Create new account by administrator (no email checks).
     *
     * @param string $email
     * @param string $password
     * @param string $title
     * @param string $city
     * @param string $phone
     * @param string $tenhouId
     * @return int
    */
    public function createAccount(string $email, string $password, string $title, string $city, string $phone, string $tenhouId): int
    {
        return $this->_client->CreateAccount(
            [],
            (new \Common\Persons_CreateAccount_Payload())
                ->setEmail($email)
                ->setPassword($password)
                ->setTitle($title)
                ->setCity($city)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getPersonId();
    }

    /**
     *  Create new group in admin interface
     *  Returns new group id
     *
     * @param string $title
     * @param string $description
     * @param string $color
     * @return int
    */
    public function createGroup(string $title, string $description, string $color): int
    {
        return $this->_client->CreateGroup(
            [],
            (new \Common\Persons_CreateGroup_Payload())
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getGroupId();
    }

    /**
     *  Update group info in admin interface
     *
     * @param int $id
     * @param string $title
     * @param string $description
     * @param string $color
     * @return bool
    */
    public function updateGroup(int $id, string $title, string $description, string $color): bool
    {
        return $this->_client->UpdateGroup(
            [],
            (new \Common\Persons_UpdateGroup_Payload())
                ->setGroupId($id)
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getSuccess();
    }

    /**
     *  Delete group and all of its linked dependencies
     *
     * @param int $id
     * @return bool
    */
    public function deleteGroup(int $id): bool
    {
        return $this->_client->DeleteGroup(
            [],
            (new \Common\Persons_DeleteGroup_Payload())
                ->setGroupId($id)
        )->getSuccess();
    }

    /**
     *  Add person to group
     *
     * @param int $personId
     * @param int $groupId
     * @return bool
    */
    public function addPersonToGroup(int $personId, int $groupId): bool
    {
        return $this->_client->AddPersonToGroup(
            [],
            (new \Common\Persons_AddPersonToGroup_Payload())
                ->setPersonId($personId)
                ->setGroupId($groupId)
        )->getSuccess();
    }

    /**
     *  Remove person from group
     *
     * @param int $personId
     * @param int $groupId
     * @return bool
    */
    public function removePersonFromGroup(int $personId, int $groupId): bool
    {
        return $this->_client->RemovePersonFromGroup(
            [],
            (new \Common\Persons_RemovePersonFromGroup_Payload())
                ->setPersonId($personId)
                ->setGroupId($groupId)
        )->getSuccess();
    }

    /**
     *  List persons of group
     *
     * @param int $groupId
     * @return array
    */
    public function getPersonsOfGroup(int $groupId): array
    {
        $persons = $this->_client->GetPersonsOfGroup(
            [],
            (new \Common\Persons_GetPersonsOfGroup_Payload())
                ->setGroupId($groupId)
        )->getPersons();

        return array_map(function(\Common\Person $person) {
            return [
                'id' => $person->getId(),
                'city' => $person->getCity(),
                'tenhou_id' => $person->getTenhouId(),
                'title' => $person->getTitle(),
            ];
        }, iterator_to_array($persons));
    }

    /**
     *  List groups of person
     *
     * @param int $personId
     * @return array
    */
    public function getGroupsOfPerson(int $personId): array
    {
        $groups = $this->_client->GetGroupsOfPerson(
            [],
            (new \Common\Persons_GetGroupsOfPerson_Payload())
        )->getGroups();

        return array_map(function(\Common\Group $group) {
            return [
                'id' => $group->getId(),
                'title' => $group->getTitle(),
                'label_color' => $group->getColor(),
                'description' => $group->getDescription(),
            ];
        }, iterator_to_array($groups));
    }

    /**
     *  Add new system-wide rule for a person.
     *
     *
     *
     * @param string $ruleName
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @param int $personId
     * @return int|null
    */
    public function addSystemWideRuleForPerson(string $ruleName, $ruleValue, string $ruleType, int $personId)
    {
        return $this->_client->AddSystemWideRuleForPerson(
            [],
            (new \Common\Access_AddSystemWideRuleForPerson_Payload())
                ->setRuleName($ruleName)
                ->setRuleValue(self::_toRuleValue($ruleValue))
                ->setRuleType($ruleType)
                ->setPersonId($personId)
        )->getRuleId();
    }

    /**
     *  Add new system-wide rule for a group.
     *
     *
     *
     * @param string $ruleName
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @param int $groupId
     * @return int|null
    */
    public function addSystemWideRuleForGroup(string $ruleName, $ruleValue, string $ruleType, int $groupId)
    {
        return $this->_client->AddSystemWideRuleForGroup(
            [],
            (new \Common\Access_AddSystemWideRuleForGroup_Payload())
                ->setRuleName($ruleName)
                ->setRuleValue(self::_toRuleValue($ruleValue))
                ->setRuleType($ruleType)
                ->setGroupId($groupId)
        )->getRuleId();
    }
}
