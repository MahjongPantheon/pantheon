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
     *  Get all event referees
     *  Format: [[rule_id => int, id => int, name => string], ...]
     *
     * @param int $eventId
     * @return array
     */
    public function getEventReferees(int $eventId): array
    {
        $rules = $this->_client->GetEventReferees(
            $this->_ctx,
            (new \Common\AccessGetEventRefereesPayload())
                ->setEventId($eventId)
        )->getReferees()->getIterator();

        return array_map(function (\Common\EventReferee $rule) {
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
