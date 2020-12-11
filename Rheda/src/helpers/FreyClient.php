<?php

namespace Rheda;

require_once __DIR__ . '/HttpClient.php'; // TODO: replace with custom jsonrpc httpclient implementation path
require_once __DIR__ . '/interfaces/IFreyClient.php'; // TODO: replace with custom frey client interface path

/**
 * Class FreyClient
 * THIS IS A GENERATED FILE! DO NOT MODIFY BY HAND, USE bin/clientGen.php
 *
 * @package Rheda */
class FreyClient implements IFreyClient
{
    /**
    * @var \JsonRPC\Client
    */
    protected $_client;

    public function __construct(string $apiUrl)
    {
        $this->_client = new \JsonRPC\Client($apiUrl, false, new HttpClient($apiUrl));
    }

    /**
     * @returns \JsonRPC\Client
     */
    public function getClient()
    {
        return $this->_client;
    }

    /**
     *  Request new registration with given email and password.
     *  Approval code is returned. It is intended to be sent to provided email address.
     * @param string $email
     * @param string $password
     * @returns string
     */
    public function requestRegistration(string $email, string $password): string
    {
        return (string)$this->_client->execute('requestRegistration', [$email, $password]);
    }

    /**
     *  Approve registration with approval code.
     *  Returns new person's ID on success.
     * @param string $approvalCode
     * @returns int
     */
    public function approveRegistration(string $approvalCode): int
    {
        return (int)$this->_client->execute('approveRegistration', [$approvalCode]);
    }

    /**
     *  Authorize person ant return permanent client-side auth token.
     * @param string $email
     * @param string $password
     * @returns array
     */
    public function authorize(string $email, string $password): array
    {
        return (array)$this->_client->execute('authorize', [$email, $password]);
    }

    /**
     *  Check if client-side token matches stored password hash.
     *  Useful for cookie-check.
     * @param int $id
     * @param string $clientSideToken
     * @returns bool
     */
    public function quickAuthorize(int $id, string $clientSideToken): bool
    {
        return (bool)$this->_client->execute('quickAuthorize', [$id, $clientSideToken]);
    }

    /**
     *  Change password when old password is known.
     *  Returns new client-side auth token on success
     * @param string $email
     * @param string $password
     * @param string $newPassword
     * @returns string
     */
    public function changePassword(string $email, string $password, string $newPassword): string
    {
        return (string)$this->_client->execute('changePassword', [$email, $password, $newPassword]);
    }

    /**
     *  Request password reset.
     *  Returns reset approval token, which should be sent over email to user.
     * @param string $email
     * @returns string
     */
    public function requestResetPassword(string $email): string
    {
        return (string)$this->_client->execute('requestResetPassword', [$email]);
    }

    /**
     *  Approve password reset.
     *  Generates digit-code and uses it as a new password, updates all records
     *  and returns the code. Code should be sent to person via email, and person
     *  should be asked to change the password immediately.
     * @param string $email
     * @param string $resetApprovalCode
     * @returns int
     */
    public function approveResetPassword(string $email, string $resetApprovalCode): int
    {
        return (int)$this->_client->execute('approveResetPassword', [$email, $resetApprovalCode]);
    }

    /**
     *  Primary client method, aggregating rules from groups and person.
     *  Get array of access rules for person in event.
     *  Cached for 10 minutes.
     * @param int $personIdcurrentEventId
     * @param int $eventId
     * @returns array
     */
    public function getAccessRules(int $personIdcurrentEventId, int $eventId): array
    {
        return (array)$this->_client->execute('getAccessRules', [$personIdcurrentEventId, $eventId]);
    }

    /**
     *  Get single rule for person in event. Hardly relies on cache.
     *  Also counts group rules if person belongs to one or more groups.
     *  Typically should not be used when more than one value should be retrieved.
     *  Returns null if no data found for provided person/event ids or rule name.
     * @param int $personId
     * @param int $eventId
     * @param string $ruleName
     * @returns mixed
     */
    public function getRuleValue(int $personId, int $eventId, string $ruleName)
    {
        return $this->_client->execute('getRuleValue', [$personId, $eventId, $ruleName]);
    }

    /**
     * @param string $id
     * @param string $title
     * @param string $city
     * @param string $email
     * @param string $phone
     * @param string $tenhouId
     * @returns bool
     */
    public function updatePersonalInfo(string $id, string $title, string $city, string $email, string $phone, string $tenhouId): bool
    {
        return (bool)$this->_client->execute('updatePersonalInfo', [$id, $title, $city, $email, $phone, $tenhouId]);
    }

    /**
     *  Get personal info by id list.
     *  May or may not include private data (depending on admin rights of requesting user).
     * @param array $ids
     * @returns array
     */
    public function getPersonalInfo(array $ids): array
    {
        return (array)$this->_client->execute('getPersonalInfo', [$ids]);
    }

    /**
     *  Get personal info by tenhou id list.
     *  May or may not include private data (depending on admin rights of requesting user).
     * @param array $ids
     * @returns array
     */
    public function findByTenhouIds(array $ids): array
    {
        return (array)$this->_client->execute('findByTenhouIds', [$ids]);
    }

    /**
     *  Fuzzy (pattern) search by title.
     *  Query should not contain % or _ characters (they will be cut though)
     *  Query should be more than 2 characters long.
     * @param string $query
     * @returns array
     */
    public function findByTitle(string $query): array
    {
        return (array)$this->_client->execute('findByTitle', [$query]);
    }

    /**
     *  Get info of groups by id list
     * @param array $ids
     * @returns array
     */
    public function getGroups(array $ids): array
    {
        return (array)$this->_client->execute('getGroups', [$ids]);
    }

    /**
     *  Get access rules for person.
     *  - eventId may be null to get system-wide rules.
     *  - Method results are not cached!
     *  - To be used in admin panel, but not in client side!
     * @param int $personId
     * @param int|null $eventId
     * @returns array
     */
    public function getPersonAccess(int $personId, $eventId): array
    {
        return (array)$this->_client->execute('getPersonAccess', [$personId, $eventId]);
    }

    /**
     *  Get access rules for group.
     *  - eventId may be null to get system-wide rules.
     *  - Method results are not cached!
     *  - To be used in admin panel, but not in client side!
     * @param int $groupId
     * @param int|null $eventId
     * @returns array
     */
    public function getGroupAccess(int $groupId, $eventId): array
    {
        return (array)$this->_client->execute('getGroupAccess', [$groupId, $eventId]);
    }

    /**
     *  Add new rule for a person.
     * @param string $ruleName
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @param int $personId
     * @param int $eventId
     * @returns int
     */
    public function addRuleForPerson(string $ruleName, $ruleValue, string $ruleType, int $personId, int $eventId): int
    {
        return (int)$this->_client->execute('addRuleForPerson', [$ruleName, $ruleValue, $ruleType, $personId, $eventId]);
    }

    /**
     *  Add new rule for a group.
     * @param string $ruleName
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @param int $groupId
     * @param int $eventId
     * @returns int
     */
    public function addRuleForGroup(string $ruleName, $ruleValue, string $ruleType, int $groupId, int $eventId): int
    {
        return (int)$this->_client->execute('addRuleForGroup', [$ruleName, $ruleValue, $ruleType, $groupId, $eventId]);
    }

    /**
     *  Update personal rule value and/or type
     * @param integer $ruleId
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @returns bool
     */
    public function updateRuleForPerson(integer $ruleId, $ruleValue, string $ruleType): bool
    {
        return (bool)$this->_client->execute('updateRuleForPerson', [$ruleId, $ruleValue, $ruleType]);
    }

    /**
     *  Update group rule value and/or type
     * @param int $ruleId
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @returns bool
     */
    public function updateRuleForGroup(int $ruleId, $ruleValue, string $ruleType): bool
    {
        return (bool)$this->_client->execute('updateRuleForGroup', [$ruleId, $ruleValue, $ruleType]);
    }

    /**
     *  Drop personal rule by id
     * @param int $ruleId
     * @returns bool
     */
    public function deleteRuleForPerson(int $ruleId): bool
    {
        return (bool)$this->_client->execute('deleteRuleForPerson', [$ruleId]);
    }

    /**
     *  Drop group rule by id
     * @param int $ruleId
     * @returns bool
     */
    public function deleteRuleForGroup(int $ruleId): bool
    {
        return (bool)$this->_client->execute('deleteRuleForGroup', [$ruleId]);
    }

    /**
     *  Clear cache for access rules of person in event.
     *  Warning: clearing whole cache is explicitly NOT IMPLEMENTED. When altering groups access rules,
     *  it's better to wait for 10mins than cause shitload on DB.
     * @param int $personId
     * @param int $eventId
     * @returns bool
     */
    public function clearAccessCache(int $personId, int $eventId): bool
    {
        return (bool)$this->_client->execute('clearAccessCache', [$personId, $eventId]);
    }

    /**
     *  Create new account by administrator (no email checks).
     * @param string $email
     * @param string $password
     * @param string $title
     * @param string $city
     * @param string $phone
     * @param string $tenhouId
     * @returns int
     */
    public function createAccount(string $email, string $password, string $title, string $city, string $phone, string $tenhouId): int
    {
        return (int)$this->_client->execute('createAccount', [$email, $password, $title, $city, $phone, $tenhouId]);
    }

    /**
     *  Create new group in admin interface
     *  Returns new group id
     * @param string $title
     * @param string $description
     * @param string $color
     * @returns int
     */
    public function createGroup(string $title, string $description, string $color): int
    {
        return (int)$this->_client->execute('createGroup', [$title, $description, $color]);
    }

    /**
     *  Update group info in admin interface
     * @param int $id
     * @param string $title
     * @param string $description
     * @param string $color
     * @returns bool
     */
    public function updateGroup(int $id, string $title, string $description, string $color): bool
    {
        return (bool)$this->_client->execute('updateGroup', [$id, $title, $description, $color]);
    }

    /**
     *  Delete group and all of its linked dependencies
     * @param int $id
     * @returns bool
     */
    public function deleteGroup(int $id): bool
    {
        return (bool)$this->_client->execute('deleteGroup', [$id]);
    }

    /**
     *  Add person to group
     * @param int $personId
     * @param int $groupId
     * @returns bool
     */
    public function addPersonToGroup(int $personId, int $groupId): bool
    {
        return (bool)$this->_client->execute('addPersonToGroup', [$personId, $groupId]);
    }

    /**
     *  Remove person from group
     * @param int $personId
     * @param int $groupId
     * @returns bool
     */
    public function removePersonFromGroup(int $personId, int $groupId): bool
    {
        return (bool)$this->_client->execute('removePersonFromGroup', [$personId, $groupId]);
    }

    /**
     *  List persons of group
     * @param int $groupId
     * @returns array
     */
    public function getPersonsOfGroup(int $groupId): array
    {
        return (array)$this->_client->execute('getPersonsOfGroup', [$groupId]);
    }

    /**
     *  List groups of person
     * @param int $personId
     * @returns array
     */
    public function getGroupsOfPerson(int $personId): array
    {
        return (array)$this->_client->execute('getGroupsOfPerson', [$personId]);
    }

    /**
     *  Add new system-wide rule for a person.
     * @param string $ruleName
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @param int $personId
     * @returns int
     */
    public function addSystemWideRuleForPerson(string $ruleName, $ruleValue, string $ruleType, int $personId): int
    {
        return (int)$this->_client->execute('addSystemWideRuleForPerson', [$ruleName, $ruleValue, $ruleType, $personId]);
    }

    /**
     *  Add new system-wide rule for a group.
     * @param string $ruleName
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @param int $groupId
     * @returns int
     */
    public function addSystemWideRuleForGroup(string $ruleName, $ruleValue, string $ruleType, int $groupId): int
    {
        return (int)$this->_client->execute('addSystemWideRuleForGroup', [$ruleName, $ruleValue, $ruleType, $groupId]);
    }
}
