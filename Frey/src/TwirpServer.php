<?php

namespace Frey;

use Common\Frey;
use Exception;
use Memcached;
use Monolog\Handler\ErrorLogHandler;
use Monolog\Logger;

require_once __DIR__ . '/helpers/Config.php';
require_once __DIR__ . '/helpers/Db.php';
require_once __DIR__ . '/helpers/Meta.php';
require_once __DIR__ . '/helpers/ErrorHandler.php';
require_once __DIR__ . '/controllers/Access.php';
require_once __DIR__ . '/controllers/Persons.php';
require_once __DIR__ . '/controllers/Auth.php';

/**
 * Thin mediator between new twirp API and existing controllers
 */
final class TwirpServer implements Frey
{
    protected AuthController $_authController;
    protected PersonsController $_personsController;
    protected AccessController $_accessController;
    protected IDb $_db;
    protected Logger $_syslog;
    protected Meta $_meta;
    protected Config $_config;
    protected Memcached $_mc;

    /**
     * @param string|null $configPath
     * @throws Exception
     */
    public function __construct($configPath = '')
    {
        $cfgPath = empty($configPath) ? __DIR__ . '/../config/index.php' : $configPath;
        $this->_config = new Config($cfgPath);
        date_default_timezone_set((string)$this->_config->getValue('serverDefaultTimezone'));
        $this->_db = new Db($this->_config);
        $storage = new \Common\Storage($this->_config->getValue('cookieDomain'));
        $this->_meta = new Meta($storage, $_SERVER);
        $this->_mc = new Memcached();
        $this->_mc->addServer('127.0.0.1', 11211);
        $this->_syslog = new Logger('RiichiApi');
        $this->_syslog->pushHandler(new ErrorLogHandler());

        // + some custom handler for testing errors
        if ($this->_config->getValue('verbose')) {
            (new ErrorHandler($this->_config, $this->_syslog))->register();
        }

        $this->_authController = new AuthController($this->_db, $this->_syslog, $this->_config, $this->_meta, $this->_mc);
        $this->_personsController = new PersonsController($this->_db, $this->_syslog, $this->_config, $this->_meta, $this->_mc);
        $this->_accessController = new AccessController($this->_db, $this->_syslog, $this->_config, $this->_meta, $this->_mc);
    }

    /**
     * @param mixed $value
     * @return \Common\RuleValue
     */
    protected static function _toRuleValue($value): \Common\RuleValue
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
     * @return \Common\EventRuleListItem
     */
    protected static function _toRuleListItem($value): \Common\EventRuleListItem
    {
        return (new \Common\EventRuleListItem())
            ->setIsGlobal($value['isGlobal'])
            ->setId($value['id'])
            ->setValue(self::_toRuleValue($value['value']))
            ->setName($value['name'])
            ->setOwnerTitle($value['ownerTitle'])
            ->setAllowedValues($value['allowed_values']);
    }

    /**
     * @throws InvalidParametersException
     */
    public function RequestRegistration(array $ctx, \Common\AuthRequestRegistrationPayload $req): \Common\AuthRequestRegistrationResponse
    {
        try {
            return (new \Common\AuthRequestRegistrationResponse())
                ->setApprovalCode($this->_authController->requestRegistration(
                    $req->getEmail(),
                    $req->getTitle(),
                    $req->getPassword(),
                    $req->getSendEmail()
                ));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     */
    public function ApproveRegistration(array $ctx, \Common\AuthApproveRegistrationPayload $req): \Common\AuthApproveRegistrationResponse
    {
        try {
            return (new \Common\AuthApproveRegistrationResponse())
                ->setPersonId($this->_authController->approveRegistration(
                    $req->getApprovalCode()
                ));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     * @throws AuthFailedException
     */
    public function Authorize(array $ctx, \Common\AuthAuthorizePayload $req): \Common\AuthAuthorizeResponse
    {
        try {
            $ret = $this->_authController->authorize($req->getEmail(), $req->getPassword());
            return (new \Common\AuthAuthorizeResponse())
                ->setPersonId($ret[0])
                ->setAuthToken($ret[1]);
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     */
    public function QuickAuthorize(array $ctx, \Common\AuthQuickAuthorizePayload $req): \Common\AuthQuickAuthorizeResponse
    {
        try {
            return (new \Common\AuthQuickAuthorizeResponse())
                ->setAuthSuccess($this->_authController->quickAuthorize(
                    $req->getPersonId(),
                    $req->getAuthToken()
                ));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     * @throws AuthFailedException
     */
    public function Me(array $ctx, \Common\AuthMePayload $req): \Common\AuthMeResponse
    {
        try {
            $ret = $this->_authController->me($req->getPersonId(), $req->getAuthToken());
            return (new \Common\AuthMeResponse())
                ->setPersonId($ret['id'])
                ->setCountry($ret['country'])
                ->setCity($ret['city'])
                ->setEmail($ret['email'])
                ->setPhone($ret['phone'])
                ->setTenhouId($ret['tenhou_id'])
                ->setGroups($ret['groups'])
                ->setTitle($ret['title']);
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     * @throws AuthFailedException
     */
    public function ChangePassword(array $ctx, \Common\AuthChangePasswordPayload $req): \Common\AuthChangePasswordResponse
    {
        try {
            return (new \Common\AuthChangePasswordResponse())
                ->setAuthToken($this->_authController->changePassword(
                    $req->getEmail(),
                    $req->getPassword(),
                    $req->getNewPassword()
                ));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     */
    public function RequestResetPassword(array $ctx, \Common\AuthRequestResetPasswordPayload $req): \Common\AuthRequestResetPasswordResponse
    {
        try {
            return (new \Common\AuthRequestResetPasswordResponse())
                ->setResetToken($this->_authController->requestResetPassword($req->getEmail(), $req->getSendEmail()));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     * @throws AuthFailedException
     */
    public function ApproveResetPassword(array $ctx, \Common\AuthApproveResetPasswordPayload $req): \Common\AuthApproveResetPasswordResponse
    {
        try {
            return (new \Common\AuthApproveResetPasswordResponse())
                ->setNewTmpPassword($this->_authController->approveResetPassword($req->getEmail(), $req->getResetToken()));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function GetAccessRules(array $ctx, \Common\AccessGetAccessRulesPayload $req): \Common\AccessGetAccessRulesResponse
    {
        try {
            $ret = $this->_accessController->getAccessRules($req->getPersonId(), $req->getEventId());
            return (new \Common\AccessGetAccessRulesResponse())
                ->setRules((new \Common\AccessRules())->setRules(
                    array_combine(
                        array_keys($ret),
                        /** @phpstan-ignore-next-line */
                        array_map('self::_toRuleValue', array_values($ret))
                    )
                ));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function GetRuleValue(array $ctx, \Common\AccessGetRuleValuePayload $req): \Common\AccessGetRuleValueResponse
    {
        try {
            $ret = $this->_accessController->getRuleValue($req->getPersonId(), $req->getEventId(), $req->getRuleName());
            return (new \Common\AccessGetRuleValueResponse())->setValue(self::_toRuleValue($ret));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws InvalidParametersException
     */
    public function UpdatePersonalInfo(array $ctx, \Common\PersonsUpdatePersonalInfoPayload $req): \Common\GenericSuccessResponse
    {
        try {
            return (new \Common\GenericSuccessResponse())->setSuccess(
                $this->_personsController->updatePersonalInfo(
                    $req->getId(),
                    $req->getTitle(),
                    $req->getCountry(),
                    $req->getCity(),
                    $req->getEmail(),
                    $req->getPhone(),
                    $req->getTenhouId(),
                    $req->getHasAvatar(),
                    $req->getAvatarData()
                )
            );
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function GetPersonalInfo(array $ctx, \Common\PersonsGetPersonalInfoPayload $req): \Common\PersonsGetPersonalInfoResponse
    {
        try {
            return (new \Common\PersonsGetPersonalInfoResponse())->setPeople(
                array_map(function ($person) {
                    return (new \Common\PersonEx())
                        ->setId($person['id'])
                        ->setCountry($person['country'])
                        ->setCity($person['city'])
                        ->setEmail($person['email'] ?? '') // TODO: should this be null in proto?
                        ->setPhone($person['phone'] ?? '') // TODO same
                        ->setTenhouId($person['tenhou_id'])
                        ->setGroups($person['groups'])
                        ->setHasAvatar($person['has_avatar'])
                        ->setTitle($person['title']);
                }, $this->_personsController->getPersonalInfo(iterator_to_array($req->getIds())))
            );
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function FindByTenhouIds(array $ctx, \Common\PersonsFindByTenhouIdsPayload $req): \Common\PersonsFindByTenhouIdsResponse
    {
        try {
            return (new \Common\PersonsFindByTenhouIdsResponse())
                ->setPeople(array_map(function ($person) {
                    $p = (new \Common\PersonEx())
                        ->setId($person['id'])
                        ->setCity($person['city'])
                        ->setTenhouId($person['tenhou_id'])
                        ->setGroups($person['groups'])
                        ->setHasAvatar($person['has_avatar'])
                        ->setTitle($person['title']);
                    if (!empty($person['email'])) {
                        $p->setEmail($person['email']);
                    }
                    if (!empty($person['phone'])) {
                        $p->setPhone($person['phone']);
                    }
                    return $p;
                }, $this->_personsController->findByTenhouIds(iterator_to_array($req->getIds()))));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws InvalidParametersException
     */
    public function FindByTitle(array $ctx, \Common\PersonsFindByTitlePayload $req): \Common\PersonsFindByTitleResponse
    {
        try {
            return (new \Common\PersonsFindByTitleResponse())
                ->setPeople(array_map(function ($person) {
                    return (new \Common\Person())
                        ->setId($person['id'])
                        ->setCity($person['city'])
                        ->setTenhouId($person['tenhou_id'])
                        ->setTitle($person['title']);
                }, $this->_personsController->findByTitle($req->getQuery())));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws InvalidParametersException
     */
    public function GetGroups(array $ctx, \Common\PersonsGetGroupsPayload $req): \Common\PersonsGetGroupsResponse
    {
        try {
            return (new \Common\PersonsGetGroupsResponse())
                ->setGroups(array_map(function ($group) {
                    return (new \Common\Group())
                        ->setId($group['id'])
                        ->setTitle($group['title'])
                        ->setColor($group['label_color'])
                        ->setDescription($group['description']);
                }, $this->_personsController->getGroups(iterator_to_array($req->getIds()))));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    public function GetEventAdmins(array $ctx, \Common\AccessGetEventAdminsPayload $req): \Common\AccessGetEventAdminsResponse
    {
        try {
            return (new \Common\AccessGetEventAdminsResponse())
                ->setAdmins(array_map(function ($rule) {
                    return (new \Common\EventAdmin())
                        ->setPersonId($rule['id'])
                        ->setPersonName($rule['name'])
                        ->setRuleId($rule['rule_id']);
                }, $this->_accessController->getEventAdmins($req->getEventId())));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function GetSuperadminFlag(array $ctx, \Common\AccessGetSuperadminFlagPayload $req): \Common\AccessGetSuperadminFlagResponse
    {
        try {
            return (new \Common\AccessGetSuperadminFlagResponse())
                ->setIsAdmin($this->_accessController->getSuperadminFlag($req->getPersonId()));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function GetOwnedEventIds(array $ctx, \Common\AccessGetOwnedEventIdsPayload $req): \Common\AccessGetOwnedEventIdsResponse
    {
        try {
            return (new \Common\AccessGetOwnedEventIdsResponse())
                ->setEventIds($this->_accessController->getOwnedEventIds($req->getPersonId()));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function GetRulesList(array $ctx, \Common\AccessGetRulesListPayload $req): \Common\AccessGetRulesListResponse
    {
        try {
            return (new \Common\AccessGetRulesListResponse())
                ->setItems($this->_accessController->getRulesList());
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function GetAllEventRules(array $ctx, \Common\AccessGetAllEventRulesPayload $req): \Common\AccessGetAllEventRulesResponse
    {
        try {
            $rules = $this->_accessController->getAllEventRules($req->getEventId());
            return (new \Common\AccessGetAllEventRulesResponse())
                /** @phpstan-ignore-next-line */
                ->setGroupRules(array_map('self::_toRuleListItem', $rules['group']))
                /** @phpstan-ignore-next-line */
                ->setPersonRules(array_map('self::_toRuleListItem', $rules['person']));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function GetPersonAccess(array $ctx, \Common\AccessGetPersonAccessPayload $req): \Common\AccessGetPersonAccessResponse
    {
        try {
            $ret = $this->_accessController->getPersonAccess($req->getPersonId(), $req->getEventId());
            return (new \Common\AccessGetPersonAccessResponse())->setRules(
                (new \Common\AccessRules())->setRules(
                    array_combine(
                        array_keys($ret),
                        /** @phpstan-ignore-next-line */
                        array_map('self::_toRuleValue', array_values($ret))
                    )
                )
            );
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function GetGroupAccess(array $ctx, \Common\AccessGetGroupAccessPayload $req): \Common\AccessGetGroupAccessResponse
    {
        try {
            $ret = $this->_accessController->getGroupAccess($req->getGroupId(), $req->getEventId());
            return (new \Common\AccessGetGroupAccessResponse())
                ->setRules(
                    (new \Common\AccessRules())->setRules(
                        array_combine(
                            array_keys($ret),
                            /** @phpstan-ignore-next-line */
                            array_map('self::_toRuleValue', array_values($ret))
                        )
                    )
                );
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function GetAllPersonAccess(array $ctx, \Common\AccessGetAllPersonAccessPayload $req): \Common\AccessGetAllPersonAccessResponse
    {
        try {
            $ret = $this->_accessController->getAllPersonAccess($req->getPersonId());
            return (new \Common\AccessGetAllPersonAccessResponse())
                ->setRulesByEvent(array_combine(
                    array_keys($ret),
                    array_map(function ($eventRules) {
                        return (new \Common\RuleListItemExMap())
                            ->setRules(
                                array_combine(
                                    array_keys($eventRules),
                                    /** @phpstan-ignore-next-line */
                                    array_map('self::_toRuleValue', array_values($eventRules))
                                )
                            );
                    }, array_values($ret))
                ));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function GetAllGroupAccess(array $ctx, \Common\AccessGetAllGroupAccessPayload $req): \Common\AccessGetAllGroupAccessResponse
    {
        try {
            $ret = $this->_accessController->getAllGroupAccess($req->getGroupId());
            return (new \Common\AccessGetAllGroupAccessResponse())
                ->setRulesByEvent(array_combine(
                    array_keys($ret),
                    array_map(function ($eventRules) {
                        return (new \Common\RuleListItemExMap())
                            ->setRules(
                                array_combine(
                                    array_keys($eventRules),
                                    /** @phpstan-ignore-next-line */
                                    array_map('self::_toRuleValue', array_values($eventRules))
                                )
                            );
                    }, array_values($ret))
                ));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     * @throws DuplicateEntityException
     */
    public function AddRuleForPerson(array $ctx, \Common\AccessAddRuleForPersonPayload $req): \Common\AccessAddRuleForPersonResponse
    {
        try {
            return (new \Common\AccessAddRuleForPersonResponse())
                ->setRuleId($this->_accessController->addRuleForPerson(
                    $req->getRuleName(),
                    self::_fromRuleValue($req->getRuleValue()),
                    $req->getRuleType(),
                    $req->getPersonId(),
                    $req->getEventId()
                ) ?? -1);
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     */
    public function AddRuleForGroup(array $ctx, \Common\AccessAddRuleForGroupPayload $req): \Common\AccessAddRuleForGroupResponse
    {
        try {
            return (new \Common\AccessAddRuleForGroupResponse())
                ->setRuleId($this->_accessController->addRuleForGroup(
                    $req->getRuleName(),
                    self::_fromRuleValue($req->getRuleValue()),
                    $req->getRuleType(),
                    $req->getGroupId(),
                    $req->getEventId()
                ) ?? -1);
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     */
    public function UpdateRuleForPerson(array $ctx, \Common\AccessUpdateRuleForPersonPayload $req): \Common\GenericSuccessResponse
    {
        try {
            return (new \Common\GenericSuccessResponse())
                ->setSuccess($this->_accessController->updateRuleForPerson(
                    $req->getRuleId(),
                    self::_fromRuleValue($req->getRuleValue()),
                    $req->getRuleType()
                ));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     */
    public function UpdateRuleForGroup(array $ctx, \Common\AccessUpdateRuleForGroupPayload $req): \Common\GenericSuccessResponse
    {
        try {
            return (new \Common\GenericSuccessResponse())
                ->setSuccess($this->_accessController->updateRuleForGroup(
                    $req->getRuleId(),
                    self::_fromRuleValue($req->getRuleValue()),
                    $req->getRuleType()
                ));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     */
    public function DeleteRuleForPerson(array $ctx, \Common\AccessDeleteRuleForPersonPayload $req): \Common\GenericSuccessResponse
    {
        try {
            return (new \Common\GenericSuccessResponse())
                ->setSuccess($this->_accessController->deleteRuleForPerson($req->getRuleId()));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     */
    public function DeleteRuleForGroup(array $ctx, \Common\AccessDeleteRuleForGroupPayload $req): \Common\GenericSuccessResponse
    {
        try {
            return (new \Common\GenericSuccessResponse())
                ->setSuccess($this->_accessController->deleteRuleForGroup($req->getRuleId()));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function ClearAccessCache(array $ctx, \Common\AccessClearAccessCachePayload $req): \Common\GenericSuccessResponse
    {
        try {
            return (new \Common\GenericSuccessResponse())
                ->setSuccess($this->_accessController->clearAccessCache(
                    $req->getPersonId(),
                    $req->getEventId()
                ));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function CreateAccount(array $ctx, \Common\PersonsCreateAccountPayload $req): \Common\PersonsCreateAccountResponse
    {
        try {
            return (new \Common\PersonsCreateAccountResponse())
                ->setPersonId($this->_personsController->createAccount(
                    $req->getEmail(),
                    $req->getPassword(),
                    $req->getTitle(),
                    $req->getCity(),
                    $req->getCountry(),
                    $req->getPhone(),
                    $req->getTenhouId()
                ));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws InvalidParametersException
     */
    public function CreateGroup(array $ctx, \Common\PersonsCreateGroupPayload $req): \Common\PersonsCreateGroupResponse
    {
        try {
            return (new \Common\PersonsCreateGroupResponse())
                ->setGroupId($this->_personsController->createGroup(
                    $req->getTitle(),
                    $req->getDescription(),
                    $req->getColor()
                ));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws InvalidParametersException
     */
    public function UpdateGroup(array $ctx, \Common\PersonsUpdateGroupPayload $req): \Common\GenericSuccessResponse
    {
        try {
            return (new \Common\GenericSuccessResponse())
                ->setSuccess($this->_personsController->updateGroup(
                    $req->getGroupId(),
                    $req->getTitle(),
                    $req->getDescription(),
                    $req->getColor()
                ));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws InvalidParametersException
     */
    public function DeleteGroup(array $ctx, \Common\PersonsDeleteGroupPayload $req): \Common\GenericSuccessResponse
    {
        try {
            return (new \Common\GenericSuccessResponse())
                ->setSuccess($this->_personsController->deleteGroup($req->getGroupId()));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     */
    public function AddPersonToGroup(array $ctx, \Common\PersonsAddPersonToGroupPayload $req): \Common\GenericSuccessResponse
    {
        try {
            return (new \Common\GenericSuccessResponse())
                ->setSuccess($this->_personsController->addPersonToGroup($req->getPersonId(), $req->getGroupId()));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     */
    public function RemovePersonFromGroup(array $ctx, \Common\PersonsRemovePersonFromGroupPayload $req): \Common\GenericSuccessResponse
    {
        try {
            return (new \Common\GenericSuccessResponse())
                ->setSuccess($this->_personsController->removePersonFromGroup($req->getPersonId(), $req->getGroupId()));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     */
    public function GetPersonsOfGroup(array $ctx, \Common\PersonsGetPersonsOfGroupPayload $req): \Common\PersonsGetPersonsOfGroupResponse
    {
        try {
            return (new \Common\PersonsGetPersonsOfGroupResponse())
                ->setPeople(array_map(function ($person) {
                    return (new \Common\Person())
                        ->setId($person['id'])
                        ->setCity($person['city'])
                        ->setTenhouId($person['tenhou_id'])
                        ->setTitle($person['title']);
                }, $this->_personsController->getPersonsOfGroup($req->getGroupId())));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     */
    public function GetGroupsOfPerson(array $ctx, \Common\PersonsGetGroupsOfPersonPayload $req): \Common\PersonsGetGroupsOfPersonResponse
    {
        try {
            return (new \Common\PersonsGetGroupsOfPersonResponse())
                ->setGroups(array_map(function ($group) {
                    return (new \Common\Group())
                        ->setId($group['id'])
                        ->setTitle($group['title'])
                        ->setColor($group['label_color'])
                        ->setDescription($group['description']);
                }, $this->_personsController->getGroupsOfPerson($req->getPersonId())));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     * @throws DuplicateEntityException
     */
    public function AddSystemWideRuleForPerson(array $ctx, \Common\AccessAddSystemWideRuleForPersonPayload $req): \Common\AccessAddSystemWideRuleForPersonResponse
    {
        try {
            return (new \Common\AccessAddSystemWideRuleForPersonResponse())
                ->setRuleId($this->_accessController->addSystemWideRuleForPerson(
                    $req->getRuleName(),
                    self::_fromRuleValue($req->getRuleValue()),
                    $req->getRuleType(),
                    $req->getPersonId()
                ) ?? -1);
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     */
    public function AddSystemWideRuleForGroup(array $ctx, \Common\AccessAddSystemWideRuleForGroupPayload $req): \Common\AccessAddSystemWideRuleForGroupResponse
    {
        try {
            return (new \Common\AccessAddSystemWideRuleForGroupResponse())
                ->setRuleId($this->_accessController->addSystemWideRuleForGroup(
                    $req->getRuleName(),
                    self::_fromRuleValue($req->getRuleValue()),
                    $req->getRuleType(),
                    $req->getGroupId()
                ) ?? -1);
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }
}
