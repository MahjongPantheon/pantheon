<?php

namespace Rheda;

/**
* Interface IFreyClient
* THIS IS A GENERATED FILE! DO NOT MODIFY BY HAND, USE bin/clientGen.php
*
* @package Rheda*/
interface IFreyClient
{

public function __construct(string $apiUrl);

/**
* @return \JsonRPC\Client
*/
public function getClient();


    /**
     *  Request new registration with given email and password.
     *  Approval code is returned. It is intended to be sent to provided email address.
     * @param string $email
     * @param string $password
     * @return string
    */
    public function requestRegistration(string $email, string $password);

    /**
     *  Approve registration with approval code.
     *  Returns new person's ID on success.
     * @param string $approvalCode
     * @return int
    */
    public function approveRegistration(string $approvalCode);

    /**
     *  Authorize person ant return permanent client-side auth token.
     * @param string $email
     * @param string $password
     * @return array
    */
    public function authorize(string $email, string $password);

    /**
     *  Check if client-side token matches stored password hash.
     *  Useful for cookie-check.
     * @param int $id
     * @param string $clientSideToken
     * @return bool
    */
    public function quickAuthorize(int $id, string $clientSideToken);

    /**
     *  Change password when old password is known.
     *  Returns new client-side auth token on success
     * @param string $email
     * @param string $password
     * @param string $newPassword
     * @return string
    */
    public function changePassword(string $email, string $password, string $newPassword);

    /**
     *  Request password reset.
     *  Returns reset approval token, which should be sent over email to user.
     * @param string $email
     * @return string
    */
    public function requestResetPassword(string $email);

    /**
     *  Approve password reset.
     *  Generates digit-code and uses it as a new password, updates all records
     *  and returns the code. Code should be sent to person via email, and person
     *  should be asked to change the password immediately.
     * @param string $email
     * @param string $resetApprovalCode
     * @return string
    */
    public function approveResetPassword(string $email, string $resetApprovalCode);

    /**
     *  Primary client method, aggregating rules from groups and person.
     *  Get array of access rules for person in event.
     *  Cached for 10 minutes.
     * @param int $personId
     * @param int $eventId
     * @return array
    */
    public function getAccessRules(int $personId, int $eventId);

    /**
     *  Get single rule for person in event. Hardly relies on cache.
     *  Also counts group rules if person belongs to one or more groups.
     *  Typically should not be used when more than one value should be retrieved.
     *  Returns null if no data found for provided person/event ids or rule name.
     * @param int $personId
     * @param int $eventId
     * @param string $ruleName
     * @return mixed
    */
    public function getRuleValue(int $personId, int $eventId, string $ruleName);

    /**
     * @param string $id
     * @param string $title
     * @param string $city
     * @param string $email
     * @param string $phone
     * @param string $tenhouId
     * @return bool
    */
    public function updatePersonalInfo(string $id, string $title, string $city, string $email, string $phone, string $tenhouId);

    /**
     *  Get personal info by id list.
     *  May or may not include private data (depending on admin rights of requesting user).
     * @param array $ids
     * @return array
    */
    public function getPersonalInfo(array $ids);

    /**
     *  Get personal info by tenhou id list.
     *  May or may not include private data (depending on admin rights of requesting user).
     * @param array $ids
     * @return array
    */
    public function findByTenhouIds(array $ids);

    /**
     *  Fuzzy (pattern) search by title.
     *  Query should not contain % or _ characters (they will be cut though)
     *  Query should be more than 2 characters long.
     * @param string $query
     * @return array
    */
    public function findByTitle(string $query);

    /**
     *  Get info of groups by id list
     * @param array $ids
     * @return array
    */
    public function getGroups(array $ids);

    /**
     *  Get rule list with translations to selected locale
    
     * @return array
    */
    public function getRulesList();

    /**
     *  Get access rules for person.
     *  - eventId may be null to get system-wide rules.
     *  - Method results are not cached!
     *  - To be used in admin panel, but not in client side!
     * @param int $personId
     * @param int|null $eventId
     * @return array
    */
    public function getPersonAccess(int $personId, $eventId);

    /**
     *  Get access rules for group.
     *  - eventId may be null to get system-wide rules.
     *  - Method results are not cached!
     *  - To be used in admin panel, but not in client side!
     * @param int $groupId
     * @param int|null $eventId
     * @return array
    */
    public function getGroupAccess(int $groupId, $eventId);

    /**
     *  Get all access rules for person.
     *  - Method results are not cached!
     *  - To be used in admin panel, but not in client side!
     * @param int $personId
     * @return array
    */
    public function getAllPersonAccess(int $personId);

    /**
     *  Get all access rules for group.
     *  - Method results are not cached!
     *  - To be used in admin panel, but not in client side!
     * @param int $groupId
     * @return array
    */
    public function getAllGroupAccess(int $groupId);

    /**
     *  Add new rule for a person.
     * @param string $ruleName
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @param int $personId
     * @param int $eventId
     * @return int|null
    */
    public function addRuleForPerson(string $ruleName, $ruleValue, string $ruleType, int $personId, int $eventId);

    /**
     *  Add new rule for a group.
     * @param string $ruleName
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @param int $groupId
     * @param int $eventId
     * @return int|null
    */
    public function addRuleForGroup(string $ruleName, $ruleValue, string $ruleType, int $groupId, int $eventId);

    /**
     *  Update personal rule value and/or type
     * @param int $ruleId
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @return bool
    */
    public function updateRuleForPerson(int $ruleId, $ruleValue, string $ruleType);

    /**
     *  Update group rule value and/or type
     * @param int $ruleId
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @return bool
    */
    public function updateRuleForGroup(int $ruleId, $ruleValue, string $ruleType);

    /**
     *  Drop personal rule by id
     * @param int $ruleId
     * @return bool
    */
    public function deleteRuleForPerson(int $ruleId);

    /**
     *  Drop group rule by id
     * @param int $ruleId
     * @return bool
    */
    public function deleteRuleForGroup(int $ruleId);

    /**
     *  Clear cache for access rules of person in event.
     *  Warning: clearing whole cache is explicitly NOT IMPLEMENTED. When altering groups access rules,
     *  it's better to wait for 10mins than cause shitload on DB.
     * @param int $personId
     * @param int $eventId
     * @return bool
    */
    public function clearAccessCache(int $personId, int $eventId);

    /**
     *  Create new account by administrator (no email checks).
     * @param string $email
     * @param string $password
     * @param string $title
     * @param string $city
     * @param string $phone
     * @param string $tenhouId
     * @return int
    */
    public function createAccount(string $email, string $password, string $title, string $city, string $phone, string $tenhouId);

    /**
     *  Create new group in admin interface
     *  Returns new group id
     * @param string $title
     * @param string $description
     * @param string $color
     * @return int
    */
    public function createGroup(string $title, string $description, string $color);

    /**
     *  Update group info in admin interface
     * @param int $id
     * @param string $title
     * @param string $description
     * @param string $color
     * @return bool
    */
    public function updateGroup(int $id, string $title, string $description, string $color);

    /**
     *  Delete group and all of its linked dependencies
     * @param int $id
     * @return bool
    */
    public function deleteGroup(int $id);

    /**
     *  Add person to group
     * @param int $personId
     * @param int $groupId
     * @return bool
    */
    public function addPersonToGroup(int $personId, int $groupId);

    /**
     *  Remove person from group
     * @param int $personId
     * @param int $groupId
     * @return bool
    */
    public function removePersonFromGroup(int $personId, int $groupId);

    /**
     *  List persons of group
     * @param int $groupId
     * @return array
    */
    public function getPersonsOfGroup(int $groupId);

    /**
     *  List groups of person
     * @param int $personId
     * @return array
    */
    public function getGroupsOfPerson(int $personId);

    /**
     *  Add new system-wide rule for a person.
     * @param string $ruleName
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @param int $personId
     * @return int|null
    */
    public function addSystemWideRuleForPerson(string $ruleName, $ruleValue, string $ruleType, int $personId);

    /**
     *  Add new system-wide rule for a group.
     * @param string $ruleName
     * @param string|int|boolean $ruleValue
     * @param string $ruleType
     * @param int $groupId
     * @return int|null
    */
    public function addSystemWideRuleForGroup(string $ruleName, $ruleValue, string $ruleType, int $groupId);
}
