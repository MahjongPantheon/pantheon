<?php

namespace Mimir;

/**
* Interface IFreyClient
* THIS IS A GENERATED FILE! DO NOT MODIFY BY HAND, USE bin/clientGen.php
*
* @package Mimir*/
interface IFreyClient
{
    public function __construct(string $apiUrl);

    /**
     * @param array $headers
     * @return void
     */
    public function withHeaders(array $headers);

    /**
    * @return \Common\FreyClient
    */
    public function getClient();

    /**
     *  Request new registration with given email and password.
     *  Approval code is returned. It is intended to be sent to provided email address.
     *
     * @param string $email
     * @param string $title
     * @param string $password
     * @return string
    */
    public function requestRegistration(string $email, string $title, string $password): string;

    /**
     *  Approve registration with approval code.
     *  Returns new person's ID on success.
     *
     * @param string $approvalCode
     * @return int
    */
    public function approveRegistration(string $approvalCode): int;

    /**
     *  Authorize person and return permanent client-side auth token.
     *
     * @param string $email
     * @param string $password
     * @return array
    */
    public function authorize(string $email, string $password): array;

    /**
     *  Check if client-side token matches stored password hash.
     *  Useful for cookie-check.
     *
     * @param int $id
     * @param string $clientSideToken
     * @return bool
    */
    public function quickAuthorize(int $id, string $clientSideToken): bool;

    /**
     *  Return information about person related to client token
     *
     * @return array
    */
    public function me(): array;

    /**
     *  Change password when old password is known.
     *  Returns new client-side auth token on success
     *
     * @param string $email
     * @param string $password
     * @param string $newPassword
     * @return string
    */
    public function changePassword(string $email, string $password, string $newPassword): string;

    /**
     *  Request password reset.
     *  Returns reset approval token, which should be sent over email to user.
     *
     * @param string $email
     * @return string
    */
    public function requestResetPassword(string $email): string;

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
    public function approveResetPassword(string $email, string $resetApprovalCode): string;

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
    public function updatePersonalInfo(int $id, string $title, string $country, string $city, string $email, string $phone, string $tenhouId): bool;

    /**
     *  Get personal info by id list.
     *  May or may not include private data (depending on admin rights of requesting user).
     *
     * @param array $ids
     * @return array
    */
    public function getPersonalInfo(array $ids): array;

    /**
     *  Get personal info by tenhou id list.
     *  May or may not include private data (depending on admin rights of requesting user).
     *
     * @param array $ids
     * @return array
    */
    public function findByTenhouIds(array $ids): array;

    public function findByMajsoulAccountId(array $playersMapping): array;

    /**
     *  Fuzzy search by title.
     *  Query should 3 or more characters long.
     *
     * @param string $query
     * @return array
    */
    public function findByTitle(string $query): array;

    /**
     *  Get all event admins
     *  Format: [[rule_id => int, id => int, name => string], ...]
     *
     * @param int $eventId
     * @return array
    */
    public function getEventAdmins(int $eventId): array;

    /**
     *  Get all event referees
     *  Format: [[rule_id => int, id => int, name => string], ...]
     *
     * @param int $eventId
     * @return array
     */
    public function getEventReferees(int $eventId): array;

    /**
     *  Client method to receive super-admin flag. Intended to be used only in Mimir
     *  to determine if used has super-admin privileges independently of any event.
     *  Cached for 10 minutes.
     *
     * @param int $personId
     * @return bool
    */
    public function getSuperadminFlag(int $personId): bool;

    /**
     *  Get list of event IDs where specified person has admin privileges.
     *
     * @param int $personId
     * @return array
    */
    public function getOwnedEventIds(int $personId): array;

    /**
     *  Add new rule for a person.
     *
     *
     *
     * @param string $ruleName
     * @param int $ruleValue
     * @param int $personId
     * @param int $eventId
     * @return int|null
    */
    public function addRuleForPerson(string $ruleName, int $ruleValue, int $personId, int $eventId);

    /**
     *  Drop personal rule by id
     *
     * @param int $ruleId
     * @return bool
    */
    public function deleteRuleForPerson(int $ruleId): bool;

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
    public function createAccount(string $email, string $password, string $title, string $city, string $phone, string $tenhouId): int;

    /**
     * Get majsoul nicknames list by person id list
     * @param int[] $ids
     * @return array
     */
    public function getMajsoulNicknames($ids);
}
