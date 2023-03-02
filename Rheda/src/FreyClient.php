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

    const PRIV_IS_SUPER_ADMIN = 'IS_SUPER_ADMIN';
    const PRIV_GET_PERSON_ACCESS = 'GET_PERSON_ACCESS';
    const PRIV_GET_GROUP_ACCESS = 'GET_GROUP_ACCESS';
    const PRIV_GET_ALL_PERSON_RULES = 'GET_ALL_PERSON_RULES';
    const PRIV_GET_ALL_GROUP_RULES = 'GET_ALL_GROUP_RULES';
    const PRIV_ADD_RULE_FOR_PERSON = 'ADD_RULE_FOR_PERSON';
    const PRIV_ADD_RULE_FOR_GROUP = 'ADD_RULE_FOR_GROUP';
    const PRIV_ADD_SYSTEM_WIDE_RULE_FOR_PERSON = 'ADD_SYSTEM_WIDE_RULE_FOR_PERSON';
    const PRIV_ADD_SYSTEM_WIDE_RULE_FOR_GROUP = 'ADD_SYSTEM_WIDE_RULE_FOR_GROUP';
    const PRIV_UPDATE_RULE_FOR_PERSON = 'UPDATE_RULE_FOR_PERSON';
    const PRIV_UPDATE_RULE_FOR_GROUP = 'UPDATE_RULE_FOR_GROUP';
    const PRIV_DELETE_RULE_FOR_PERSON = 'DELETE_RULE_FOR_PERSON';
    const PRIV_DELETE_RULE_FOR_GROUP = 'DELETE_RULE_FOR_GROUP';
    const PRIV_CLEAR_ACCESS_CACHE = 'CLEAR_ACCESS_CACHE';
    const PRIV_CREATE_ACCOUNT = 'CREATE_ACCOUNT';
    const PRIV_GET_PERSONAL_INFO_WITH_PRIVATE_DATA = 'GET_PERSONAL_INFO_WITH_PRIVATE_DATA';
    const PRIV_UPDATE_PERSONAL_INFO = 'UPDATE_PERSONAL_INFO';
    const PRIV_CREATE_GROUP = 'CREATE_GROUP';
    const PRIV_UPDATE_GROUP = 'UPDATE_GROUP';
    const PRIV_DELETE_GROUP = 'DELETE_GROUP';
    const PRIV_ADD_PERSON_TO_GROUP = 'ADD_PERSON_TO_GROUP';
    const PRIV_REMOVE_PERSON_FROM_GROUP = 'REMOVE_PERSON_FROM_GROUP';
    const PRIV_CREATE_EVENT = 'CREATE_EVENT';
    const PRIV_REGISTER_PERSON = 'REGISTER_PERSON';
    const PRIV_EDIT_PERSON = 'EDIT_PERSON';
    const PRIV_ADD_USER = 'ADD_USER';
    const PRIV_ADMIN_EVENT = 'ADMIN_EVENT';
    const PRIV_EDIT_EVENT = 'EDIT_EVENT';

    public function __construct(string $apiUrl)
    {
        $this->_client = new \JsonRPC\Client($apiUrl, false, new HttpClient($apiUrl));
    }

    /**
     * @return \JsonRPC\Client
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
     * @param string $title
     * @param string $password
     * @return string
    */
    public function requestRegistration(string $email, string $title, string $password): string
    {
        /** @phpstan-ignore-next-line */
        return (string)$this->_client->execute('requestRegistration', [$email, $title, $password]);
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
        /** @phpstan-ignore-next-line */
        return (int)$this->_client->execute('approveRegistration', [$approvalCode]);
    }

    /**
     *  Authorize person and return permanent client-side auth token.
     *
     * @param string $email
     * @param string $password
     * @return array
    */
    public function authorize(string $email, string $password): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('authorize', [$email, $password]);
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
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('quickAuthorize', [$id, $clientSideToken]);
    }

    /**
     *  Return information about person related to client token
     *
     * @param int $id
     * @param string $clientSideToken
     * @return array
    */
    public function me(int $id, string $clientSideToken): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('me', [$id, $clientSideToken]);
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
        /** @phpstan-ignore-next-line */
        return (string)$this->_client->execute('changePassword', [$email, $password, $newPassword]);
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
        /** @phpstan-ignore-next-line */
        return (string)$this->_client->execute('requestResetPassword', [$email]);
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
        /** @phpstan-ignore-next-line */
        return (string)$this->_client->execute('approveResetPassword', [$email, $resetApprovalCode]);
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
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getAccessRules', [$personId, $eventId]);
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
        /** @phpstan-ignore-next-line */
        return $this->_client->execute('getRuleValue', [$personId, $eventId, $ruleName]);
    }

    /**
     * @param int $id
     * @param string $title
     * @param string $country
     * @param string $city
     * @param string $email
     * @param string $phone
     * @param string $tenhouId
     * @return bool
    */
    public function updatePersonalInfo(int $id, string $title, string $country, string $city, string $email, string $phone, string $tenhouId): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('updatePersonalInfo', [$id, $title, $country, $city, $email, $phone, $tenhouId]);
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
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getPersonalInfo', [$ids]);
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
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('findByTenhouIds', [$ids]);
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
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('findByTitle', [$query]);
    }

    /**
     *  Get info of groups by id list
     *
     * @param array $ids
     * @return array
    */
    public function getGroups(array $ids): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getGroups', [$ids]);
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
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getEventAdmins', [$eventId]);
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
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('getSuperadminFlag', [$personId]);
    }

    /**
     *  Get list of event IDs where specified person has admin privileges.
     *
     * @param int $personId
     * @return array
    */
    public function getOwnedEventIds(int $personId): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getOwnedEventIds', [$personId]);
    }

    /**
     *  Get rule list with translations to selected locale
     *
     * @return array
    */
    public function getRulesList(): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getRulesList', []);
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
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getAllEventRules', [$eventId]);
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
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getPersonAccess', [$personId, $eventId]);
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
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getGroupAccess', [$groupId, $eventId]);
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
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getAllPersonAccess', [$personId]);
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
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getAllGroupAccess', [$groupId]);
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
        /** @phpstan-ignore-next-line */
        return $this->_client->execute('addRuleForPerson', [$ruleName, $ruleValue, $ruleType, $personId, $eventId]);
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
        /** @phpstan-ignore-next-line */
        return $this->_client->execute('addRuleForGroup', [$ruleName, $ruleValue, $ruleType, $groupId, $eventId]);
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
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('updateRuleForPerson', [$ruleId, $ruleValue, $ruleType]);
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
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('updateRuleForGroup', [$ruleId, $ruleValue, $ruleType]);
    }

    /**
     *  Drop personal rule by id
     *
     * @param int $ruleId
     * @return bool
    */
    public function deleteRuleForPerson(int $ruleId): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('deleteRuleForPerson', [$ruleId]);
    }

    /**
     *  Drop group rule by id
     *
     * @param int $ruleId
     * @return bool
    */
    public function deleteRuleForGroup(int $ruleId): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('deleteRuleForGroup', [$ruleId]);
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
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('clearAccessCache', [$personId, $eventId]);
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
        /** @phpstan-ignore-next-line */
        return (int)$this->_client->execute('createAccount', [$email, $password, $title, $city, $phone, $tenhouId]);
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
        /** @phpstan-ignore-next-line */
        return (int)$this->_client->execute('createGroup', [$title, $description, $color]);
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
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('updateGroup', [$id, $title, $description, $color]);
    }

    /**
     *  Delete group and all of its linked dependencies
     *
     * @param int $id
     * @return bool
    */
    public function deleteGroup(int $id): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('deleteGroup', [$id]);
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
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('addPersonToGroup', [$personId, $groupId]);
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
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('removePersonFromGroup', [$personId, $groupId]);
    }

    /**
     *  List persons of group
     *
     * @param int $groupId
     * @return array
    */
    public function getPersonsOfGroup(int $groupId): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getPersonsOfGroup', [$groupId]);
    }

    /**
     *  List groups of person
     *
     * @param int $personId
     * @return array
    */
    public function getGroupsOfPerson(int $personId): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getGroupsOfPerson', [$personId]);
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
        /** @phpstan-ignore-next-line */
        return $this->_client->execute('addSystemWideRuleForPerson', [$ruleName, $ruleValue, $ruleType, $personId]);
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
        /** @phpstan-ignore-next-line */
        return $this->_client->execute('addSystemWideRuleForGroup', [$ruleName, $ruleValue, $ruleType, $groupId]);
    }
}
