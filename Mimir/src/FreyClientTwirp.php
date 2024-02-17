<?php

namespace Mimir;

use Twirp\Context;
use Common\RuleListItemEx;

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
    /**
     * @var \Psr\Http\Client\ClientInterface
     */
    protected $_httpClient;
    /**
     * @var array
     */
    protected $_ctx = [];

    public function __construct(string $apiUrl)
    {
        $this->_client = new \Common\FreyClient(
            $apiUrl,
            $this->_httpClient,
            null,
            null,
            '/v2'
        );
    }

    /**
     * @param array $headers
     * @return void
     */
    public function withHeaders($headers)
    {
        $this->_ctx = Context::withHttpRequestHeaders($this->_ctx, $headers);
    }

    /**
     * @param ?\Common\RuleValue $value
     * @return bool|int|string
     */
    protected static function _fromRuleValue(?\Common\RuleValue $value)
    {
        if (empty($value)) {
            return false; // TODO: kludge
        }
        if ($value->hasBoolValue()) {
            return $value->getBoolValue();
        }
        if ($value->hasNumberValue()) {
            return $value->getNumberValue();
        }
        return $value->getStringValue();
    }

    /**
     * @param mixed $value
     * @return \Common\RuleValue
     */
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
    // @phpstan-ignore-next-line
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
    public function requestRegistration(string $email, string $title, string $password): string
    {
        return $this->_client->RequestRegistration(
            $this->_ctx,
            (new \Common\AuthRequestRegistrationPayload())
                ->setEmail($email)
                ->setTitle($title)
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
            $this->_ctx,
            (new \Common\AuthApproveRegistrationPayload())
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
            $this->_ctx,
            (new \Common\AuthAuthorizePayload())
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
            $this->_ctx,
            (new \Common\AuthQuickAuthorizePayload())
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
            $this->_ctx,
            (new \Common\AuthChangePasswordPayload())
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
            $this->_ctx,
            (new \Common\AuthRequestResetPasswordPayload())
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
            $this->_ctx,
            (new \Common\AuthApproveResetPasswordPayload())
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
            $this->_ctx,
            (new \Common\AccessGetAccessRulesPayload())
                ->setPersonId($personId)
                ->setEventId($eventId)
        )->getRules();

        if (empty($ret)) {
            return []; // TODO log error
        }

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
            $this->_ctx,
            (new \Common\AccessGetRuleValuePayload())
                ->setPersonId($personId)
                ->setEventId($eventId)
                ->setRuleName($ruleName)
        )->getValue());
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
        return $this->_client->UpdatePersonalInfo(
            $this->_ctx,
            (new \Common\PersonsUpdatePersonalInfoPayload())
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
            $this->_ctx,
            (new \Common\PersonsGetPersonalInfoPayload())
                ->setIds($ids)
        )->getPeople()->getIterator();

        return array_map(function (\Common\PersonEx $person) {
            return [
                'id' => $person->getId(),
                'country' => $person->getCountry(),
                'city' => $person->getCity(),
                'email' => $person->getEmail(),
                'phone' => $person->getPhone(),
                'tenhou_id' => $person->getTenhouId(),
                'groups' => $person->getGroups(),
                'title' => $person->getTitle(),
                'has_avatar' => $person->getHasAvatar(),
                'last_update' => $person->getLastUpdate(),
                'ms_nickname' => $person->getMsNickname(),
                'ms_account_id' => $person->getMsAccountId(),
                'telegram_id' => $person->getTelegramId(),
                'notifications' => $person->getNotifications(),
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
            $this->_ctx,
            (new \Common\PersonsFindByTenhouIdsPayload())
                ->setIds($ids)
        )->getPeople()->getIterator();

        return array_map(function (\Common\PersonEx $person) {
            return [
                'id' => $person->getId(),
                'country' => $person->getCountry(),
                'city' => $person->getCity(),
                'email' => $person->getEmail(),
                'phone' => $person->getPhone(),
                'tenhou_id' => $person->getTenhouId(),
                'groups' => $person->getGroups(),
                'title' => $person->getTitle(),
                'has_avatar' => $person->getHasAvatar(),
                'last_update' => $person->getLastUpdate(),
                'ms_nickname' => $person->getMsNickname(),
                'ms_account_id' => $person->getMsAccountId(),
                'telegram_id' => $person->getTelegramId(),
                'notifications' => $person->getNotifications(),
            ];
        }, iterator_to_array($persons));
    }

    public function findByMajsoulAccountId(array $playersMapping): array
    {
        $ids = [];
        foreach ($playersMapping as $playerItem) {
            $mjsSearchItem = new \Common\MajsoulSearchEx();
            $mjsSearchItem->setNickname($playerItem['player_name']);
            $mjsSearchItem->setAccountId($playerItem['account_id']);
            array_push($ids, $mjsSearchItem);
        }

        $persons = $this->_client->FindByMajsoulAccountId(
            $this->_ctx,
            (new \Common\PersonsFindByMajsoulIdsPayload())
                ->setIds($ids)
        )->getPeople()->getIterator();

        return array_map(function (\Common\PersonEx $person) {
            return [
                'id' => $person->getId(),
                'country' => $person->getCountry(),
                'city' => $person->getCity(),
                'email' => $person->getEmail(),
                'phone' => $person->getPhone(),
                'tenhou_id' => $person->getTenhouId(),
                'groups' => $person->getGroups(),
                'title' => $person->getTitle(),
                'has_avatar' => $person->getHasAvatar(),
                'last_update' => $person->getLastUpdate(),
                'ms_nickname' => $person->getMsNickname(),
                'ms_account_id' => $person->getMsAccountId(),
                'telegram_id' => $person->getTelegramId(),
                'notifications' => $person->getNotifications(),
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
            $this->_ctx,
            (new \Common\PersonsFindByTitlePayload())
                ->setQuery($query)
        )->getPeople();

        return array_map(function (\Common\Person $person) {
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
            $this->_ctx,
            (new \Common\PersonsGetGroupsPayload())
                ->setIds($ids)
        )->getGroups();

        return array_map(function (\Common\Group $group) {
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
            $this->_ctx,
            (new \Common\AccessGetEventAdminsPayload())
                ->setEventId($eventId)
        )->getAdmins()->getIterator();

        return array_map(function (\Common\EventAdmin $rule) {
            return [
                'rule_id' => $rule->getRuleId(),
                'id' => $rule->getPersonId(),
                'name' => $rule->getPersonName(),
                'has_avatar' => $rule->getHasAvatar(),
                'last_update' => $rule->getLastUpdate(),
            ];
        }, iterator_to_array($rules));
    }

    /**
     *  Client method to receive super-admin flag. Intended to be used only in Mimir
     *  to determine if used has super-admin privileges independently of any event.
     *  Cached for 10 minutes.
     *
     * @param int $personId
     * @return bool
    */
    public function getSuperadminFlag(int $personId): bool
    {
        return $this->_client->GetSuperadminFlag(
            $this->_ctx,
            (new \Common\AccessGetSuperadminFlagPayload())
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
            $this->_ctx,
            (new \Common\AccessGetOwnedEventIdsPayload())
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
            $this->_ctx,
            (new \Common\AccessGetRulesListPayload())
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
            $this->_ctx,
            (new \Common\AccessGetAllEventRulesPayload())
        );
        $retGroup = iterator_to_array($ret->getGroupRules()->getIterator());
        $retPerson = iterator_to_array($ret->getPersonRules()->getIterator());
        $predicate = function (\Common\EventRuleListItem $rule) {
            return [
                'isGlobal' => $rule->getIsGlobal(),
                'id' => $rule->getId(),
                'type' => $rule->getValue()?->hasBoolValue() ? 'bool' : ($rule->getValue()?->hasNumberValue() ? 'number' : 'string'),
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
            $this->_ctx,
            (new \Common\AccessGetPersonAccessPayload())
                ->setPersonId($personId)
                ->setEventId($eventId ?? -1) // -1 for global
        )->getRules();

        if (empty($ret)) {
            return [];
        }

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
            $this->_ctx,
            (new \Common\AccessGetGroupAccessPayload())
                ->setGroupId($groupId)
                ->setEventId($eventId ?? -1) // -1 for global
        )->getRules();

        if (empty($ret)) {
            return [];
        }

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
            $this->_ctx,
            (new \Common\AccessGetAllPersonAccessPayload())
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
            $this->_ctx,
            (new \Common\AccessGetAllGroupAccessPayload())
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
            $this->_ctx,
            (new \Common\AccessAddRuleForPersonPayload())
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
            $this->_ctx,
            (new \Common\AccessAddRuleForGroupPayload())
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
            $this->_ctx,
            (new \Common\AccessUpdateRuleForPersonPayload())
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
            $this->_ctx,
            (new \Common\AccessUpdateRuleForGroupPayload())
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
            $this->_ctx,
            (new \Common\AccessDeleteRuleForPersonPayload())
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
            $this->_ctx,
            (new \Common\AccessDeleteRuleForGroupPayload())
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
            $this->_ctx,
            (new \Common\AccessClearAccessCachePayload())
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
            $this->_ctx,
            (new \Common\PersonsCreateAccountPayload())
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
            $this->_ctx,
            (new \Common\PersonsCreateGroupPayload())
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
            $this->_ctx,
            (new \Common\PersonsUpdateGroupPayload())
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
            $this->_ctx,
            (new \Common\PersonsDeleteGroupPayload())
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
            $this->_ctx,
            (new \Common\PersonsAddPersonToGroupPayload())
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
            $this->_ctx,
            (new \Common\PersonsRemovePersonFromGroupPayload())
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
            $this->_ctx,
            (new \Common\PersonsGetPersonsOfGroupPayload())
                ->setGroupId($groupId)
        )->getPeople();

        return array_map(function (\Common\Person $person) {
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
            $this->_ctx,
            (new \Common\PersonsGetGroupsOfPersonPayload())
                ->setPersonId($personId)
        )->getGroups();

        return array_map(function (\Common\Group $group) {
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
            $this->_ctx,
            (new \Common\AccessAddSystemWideRuleForPersonPayload())
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
            $this->_ctx,
            (new \Common\AccessAddSystemWideRuleForGroupPayload())
                ->setRuleName($ruleName)
                ->setRuleValue(self::_toRuleValue($ruleValue))
                ->setRuleType($ruleType)
                ->setGroupId($groupId)
        )->getRuleId();
    }

    /**
     * @param int $id
     * @param string $clientSideToken
     * @return array
     */
    public function me(int $id, string $clientSideToken): array
    {
        $person = $this->_client->Me(
            $this->_ctx,
            (new \Common\AuthMePayload())
                ->setPersonId($id)
                ->setAuthToken($clientSideToken)
        );
        return [
            'id' => $person->getPersonId(),
            'country' => $person->getCountry(),
            'city' => $person->getCity(),
            'email' => $person->getEmail(),
            'phone' => $person->getPhone(),
            'tenhou_id' => $person->getTenhouId(),
            'groups' => $person->getGroups(),
            'title' => $person->getTitle(),
        ];
    }

    /**
     * @param int[] $ids
     * @return array
     */
    public function getMajsoulNicknames($ids)
    {
        $mapping = $this->_client->GetMajsoulNicknames(
            $this->_ctx,
            (new \Common\PersonsGetMajsoulNicknamesPayload())->setIds($ids)
        );
        return array_reduce(
            iterator_to_array($mapping->getMapping()),
            function ($acc, \Common\MajsoulPersonMapping $item) {
                $acc[(int)$item->getPersonId()] = $item->getNickname();
                return $acc;
            },
            []
        );
    }
}
