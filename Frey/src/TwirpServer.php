<?php

namespace Frey;

use Common\Frey;
use Exception;
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
 * This should replace controllers and json-rpc api if everything goes well.
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
        $this->_syslog = new Logger('RiichiApi');
        $this->_syslog->pushHandler(new ErrorLogHandler());

        // + some custom handler for testing errors
        if ($this->_config->getValue('verbose')) {
            (new ErrorHandler($this->_config, $this->_syslog))->register();
        }

        $this->_authController = new AuthController($this->_db, $this->_syslog, $this->_config, $this->_meta);
        $this->_personsController = new PersonsController($this->_db, $this->_syslog, $this->_config, $this->_meta);
        $this->_accessController = new AccessController($this->_db, $this->_syslog, $this->_config, $this->_meta);
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
    public function RequestRegistration(array $ctx, \Common\Auth_RequestRegistration_Payload $req): \Common\Auth_RequestRegistration_Response
    {
        try {
            return (new \Common\Auth_RequestRegistration_Response())
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
    public function ApproveRegistration(array $ctx, \Common\Auth_ApproveRegistration_Payload $req): \Common\Auth_ApproveRegistration_Response
    {
        try {
            return (new \Common\Auth_ApproveRegistration_Response())
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
    public function Authorize(array $ctx, \Common\Auth_Authorize_Payload $req): \Common\Auth_Authorize_Response
    {
        try {
            $ret = $this->_authController->authorize($req->getEmail(), $req->getPassword());
            return (new \Common\Auth_Authorize_Response())
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
    public function QuickAuthorize(array $ctx, \Common\Auth_QuickAuthorize_Payload $req): \Common\Auth_QuickAuthorize_Response
    {
        try {
            return (new \Common\Auth_QuickAuthorize_Response())
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
    public function Me(array $ctx, \Common\Auth_Me_Payload $req): \Common\Auth_Me_Response
    {
        try {
            $ret = $this->_authController->me($req->getPersonId(), $req->getAuthToken());
            return (new \Common\Auth_Me_Response())
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
    public function ChangePassword(array $ctx, \Common\Auth_ChangePassword_Payload $req): \Common\Auth_ChangePassword_Response
    {
        try {
            return (new \Common\Auth_ChangePassword_Response())
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
    public function RequestResetPassword(array $ctx, \Common\Auth_RequestResetPassword_Payload $req): \Common\Auth_RequestResetPassword_Response
    {
        try {
            return (new \Common\Auth_RequestResetPassword_Response())
                ->setResetToken($this->_authController->requestResetPassword($req->getEmail()));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     * @throws AuthFailedException
     */
    public function ApproveResetPassword(array $ctx, \Common\Auth_ApproveResetPassword_Payload $req): \Common\Auth_ApproveResetPassword_Response
    {
        try {
            return (new \Common\Auth_ApproveResetPassword_Response())
                ->setNewTmpPassword($this->_authController->approveResetPassword($req->getEmail(), $req->getResetToken()));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function GetAccessRules(array $ctx, \Common\Access_GetAccessRules_Payload $req): \Common\Access_GetAccessRules_Response
    {
        try {
            $ret = $this->_accessController->getAccessRules($req->getPersonId(), $req->getEventId());
            return (new \Common\Access_GetAccessRules_Response())
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
    public function GetRuleValue(array $ctx, \Common\Access_GetRuleValue_Payload $req): \Common\Access_GetRuleValue_Response
    {
        try {
            $ret = $this->_accessController->getRuleValue($req->getPersonId(), $req->getEventId(), $req->getRuleName());
            return (new \Common\Access_GetRuleValue_Response())->setValue(self::_toRuleValue($ret));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws InvalidParametersException
     */
    public function UpdatePersonalInfo(array $ctx, \Common\Persons_UpdatePersonalInfo_Payload $req): \Common\Generic_Success_Response
    {
        try {
            return (new \Common\Generic_Success_Response())->setSuccess(
                $this->_personsController->updatePersonalInfo(
                    $req->getId(),
                    $req->getTitle(),
                    $req->getCountry(),
                    $req->getCity(),
                    $req->getEmail(),
                    $req->getPhone(),
                    $req->getTenhouId()
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
    public function GetPersonalInfo(array $ctx, \Common\Persons_GetPersonalInfo_Payload $req): \Common\Persons_GetPersonalInfo_Response
    {
        try {
            return (new \Common\Persons_GetPersonalInfo_Response())->setPersons(
                array_map(function ($person) {
                    return (new \Common\PersonEx())
                        ->setId($person['id'])
                        ->setCountry($person['country'])
                        ->setCity($person['city'])
                        ->setEmail($person['email'] ?? '') // TODO: should this be null in proto?
                        ->setPhone($person['phone'] ?? '') // TODO same
                        ->setTenhouId($person['tenhou_id'])
                        ->setGroups($person['groups'])
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
    public function FindByTenhouIds(array $ctx, \Common\Persons_FindByTenhouIds_Payload $req): \Common\Persons_FindByTenhouIds_Response
    {
        try {
            return (new \Common\Persons_FindByTenhouIds_Response())
                ->setPersons(array_map(function ($person) {
                    return (new \Common\PersonEx())
                        ->setId($person['id'])
                        ->setCity($person['city'])
                        ->setEmail($person['email'])
                        ->setPhone($person['phone'])
                        ->setTenhouId($person['tenhou_id'])
                        ->setGroups($person['groups'])
                        ->setTitle($person['title']);
                }, $this->_personsController->findByTenhouIds(iterator_to_array($req->getIds()))));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws InvalidParametersException
     */
    public function FindByTitle(array $ctx, \Common\Persons_FindByTitle_Payload $req): \Common\Persons_FindByTitle_Response
    {
        try {
            return (new \Common\Persons_FindByTitle_Response())
                ->setPersons(array_map(function ($person) {
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
    public function GetGroups(array $ctx, \Common\Persons_GetGroups_Payload $req): \Common\Persons_GetGroups_Response
    {
        try {
            return (new \Common\Persons_GetGroups_Response())
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

    public function GetEventAdmins(array $ctx, \Common\Access_GetEventAdmins_Payload $req): \Common\Access_GetEventAdmins_Response
    {
        try {
            return (new \Common\Access_GetEventAdmins_Response())
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
    public function GetSuperadminFlag(array $ctx, \Common\Access_GetSuperadminFlag_Payload $req): \Common\Access_GetSuperadminFlag_Response
    {
        try {
            return (new \Common\Access_GetSuperadminFlag_Response())
                ->setIsAdmin($this->_accessController->getSuperadminFlag($req->getPersonId()));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function GetOwnedEventIds(array $ctx, \Common\Access_GetOwnedEventIds_Payload $req): \Common\Access_GetOwnedEventIds_Response
    {
        try {
            return (new \Common\Access_GetOwnedEventIds_Response())
                ->setEventIds($this->_accessController->getOwnedEventIds($req->getPersonId()));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function GetRulesList(array $ctx, \Common\Access_GetRulesList_Payload $req): \Common\Access_GetRulesList_Response
    {
        try {
            return (new \Common\Access_GetRulesList_Response())
                ->setItems($this->_accessController->getRulesList());
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function GetAllEventRules(array $ctx, \Common\Access_GetAllEventRules_Payload $req): \Common\Access_GetAllEventRules_Response
    {
        try {
            $rules = $this->_accessController->getAllEventRules($req->getEventId());
            return (new \Common\Access_GetAllEventRules_Response())
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
    public function GetPersonAccess(array $ctx, \Common\Access_GetPersonAccess_Payload $req): \Common\Access_GetPersonAccess_Response
    {
        try {
            $ret = $this->_accessController->getPersonAccess($req->getPersonId(), $req->getEventId());
            return (new \Common\Access_GetPersonAccess_Response())->setRules(
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
    public function GetGroupAccess(array $ctx, \Common\Access_GetGroupAccess_Payload $req): \Common\Access_GetGroupAccess_Response
    {
        try {
            $ret = $this->_accessController->getGroupAccess($req->getGroupId(), $req->getEventId());
            return (new \Common\Access_GetGroupAccess_Response())
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
    public function GetAllPersonAccess(array $ctx, \Common\Access_GetAllPersonAccess_Payload $req): \Common\Access_GetAllPersonAccess_Response
    {
        try {
            $ret = $this->_accessController->getAllPersonAccess($req->getPersonId());
            return (new \Common\Access_GetAllPersonAccess_Response())
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
    public function GetAllGroupAccess(array $ctx, \Common\Access_GetAllGroupAccess_Payload $req): \Common\Access_GetAllGroupAccess_Response
    {
        try {
            $ret = $this->_accessController->getAllGroupAccess($req->getGroupId());
            return (new \Common\Access_GetAllGroupAccess_Response())
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
    public function AddRuleForPerson(array $ctx, \Common\Access_AddRuleForPerson_Payload $req): \Common\Access_AddRuleForPerson_Response
    {
        try {
            return (new \Common\Access_AddRuleForPerson_Response())
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
    public function AddRuleForGroup(array $ctx, \Common\Access_AddRuleForGroup_Payload $req): \Common\Access_AddRuleForGroup_Response
    {
        try {
            return (new \Common\Access_AddRuleForGroup_Response())
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
    public function UpdateRuleForPerson(array $ctx, \Common\Access_UpdateRuleForPerson_Payload $req): \Common\Generic_Success_Response
    {
        try {
            return (new \Common\Generic_Success_Response())
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
    public function UpdateRuleForGroup(array $ctx, \Common\Access_UpdateRuleForGroup_Payload $req): \Common\Generic_Success_Response
    {
        try {
            return (new \Common\Generic_Success_Response())
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
    public function DeleteRuleForPerson(array $ctx, \Common\Access_DeleteRuleForPerson_Payload $req): \Common\Generic_Success_Response
    {
        try {
            return (new \Common\Generic_Success_Response())
                ->setSuccess($this->_accessController->deleteRuleForPerson($req->getRuleId()));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws EntityNotFoundException
     */
    public function DeleteRuleForGroup(array $ctx, \Common\Access_DeleteRuleForGroup_Payload $req): \Common\Generic_Success_Response
    {
        try {
            return (new \Common\Generic_Success_Response())
                ->setSuccess($this->_accessController->deleteRuleForGroup($req->getRuleId()));
        } catch (\Exception $e) {
            $this->_syslog->error($e);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function ClearAccessCache(array $ctx, \Common\Access_ClearAccessCache_Payload $req): \Common\Generic_Success_Response
    {
        try {
            return (new \Common\Generic_Success_Response())
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
    public function CreateAccount(array $ctx, \Common\Persons_CreateAccount_Payload $req): \Common\Persons_CreateAccount_Response
    {
        try {
            return (new \Common\Persons_CreateAccount_Response())
                ->setPersonId($this->_personsController->createAccount(
                    $req->getEmail(),
                    $req->getPassword(),
                    $req->getTitle(),
                    $req->getCity(),
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
    public function CreateGroup(array $ctx, \Common\Persons_CreateGroup_Payload $req): \Common\Persons_CreateGroup_Response
    {
        try {
            return (new \Common\Persons_CreateGroup_Response())
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
    public function UpdateGroup(array $ctx, \Common\Persons_UpdateGroup_Payload $req): \Common\Generic_Success_Response
    {
        try {
            return (new \Common\Generic_Success_Response())
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
    public function DeleteGroup(array $ctx, \Common\Persons_DeleteGroup_Payload $req): \Common\Generic_Success_Response
    {
        try {
            return (new \Common\Generic_Success_Response())
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
    public function AddPersonToGroup(array $ctx, \Common\Persons_AddPersonToGroup_Payload $req): \Common\Generic_Success_Response
    {
        try {
            return (new \Common\Generic_Success_Response())
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
    public function RemovePersonFromGroup(array $ctx, \Common\Persons_RemovePersonFromGroup_Payload $req): \Common\Generic_Success_Response
    {
        try {
            return (new \Common\Generic_Success_Response())
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
    public function GetPersonsOfGroup(array $ctx, \Common\Persons_GetPersonsOfGroup_Payload $req): \Common\Persons_GetPersonsOfGroup_Response
    {
        try {
            return (new \Common\Persons_GetPersonsOfGroup_Response())
                ->setPersons(array_map(function ($person) {
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
    public function GetGroupsOfPerson(array $ctx, \Common\Persons_GetGroupsOfPerson_Payload $req): \Common\Persons_GetGroupsOfPerson_Response
    {
        try {
            return (new \Common\Persons_GetGroupsOfPerson_Response())
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
    public function AddSystemWideRuleForPerson(array $ctx, \Common\Access_AddSystemWideRuleForPerson_Payload $req): \Common\Access_AddSystemWideRuleForPerson_Response
    {
        try {
            return (new \Common\Access_AddSystemWideRuleForPerson_Response())
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
    public function AddSystemWideRuleForGroup(array $ctx, \Common\Access_AddSystemWideRuleForGroup_Payload $req): \Common\Access_AddSystemWideRuleForGroup_Response
    {
        try {
            return (new \Common\Access_AddSystemWideRuleForGroup_Response())
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
