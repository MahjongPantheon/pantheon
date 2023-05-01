<?php
/*  Mimir: mahjong games storage
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

require_once __DIR__ . '/../src/helpers/Db.php';

/**
 * Class RealApiTest: integration test suite
 * @package Frey
 */
class RealTwirpApiTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var
     */
    protected $_client;
    /**
     * @var \Frey\Db
     */
    protected $_db;

    const CURRENT_EVENT_ID = 124;

    /**
     * @throws \Exception
     */
    protected function setUp(): void
    {
        // Init db! Or bunch of PDOExceptions will appeal
        $this->_db = \Frey\Db::__getCleanTestingInstance();
        $this->_client = new \Common\FreyAdapter(
            'http://localhost:1359',
            null,
            null,
            null,
            '/v2'
        );
        $this->_client->withHeaders([
            'X-Twirp' => 'true',
            'X-Auth-Token' => '198vdsh904hfbnkjv98whb2iusvd98b29bsdv98svbr9wghj',
            'X-Internal-Query-Secret' => '198vdsh904hfbnkjv98whb2iusvd98b29bsdv98svbr9wghj',
            'X-Current-Event-Id' => self::CURRENT_EVENT_ID
        ]);
    }

    /**
     * @throws \Exception
     */
    public function testRequestRegistration()
    {
        $email = 'test@test.com';
        $password = '1234test!5678';
        $title = 'test testov';
        $approvalCode = $this->_client->RequestRegistration(
            [],
            (new \Common\AuthRequestRegistrationPayload())
                ->setEmail($email)
                ->setTitle($title)
                ->setPassword($password)
        )->getApprovalCode();
        $this->assertIsString($approvalCode);
    }

    /**
     * @throws \Exception
     */
    public function testApproveRegistration()
    {
        $email = 'test@test.com';
        $password = '12345test!678';
        $title = 'test testov';
        $approvalCode = $this->_client->RequestRegistration(
            [],
            (new \Common\AuthRequestRegistrationPayload())
                ->setEmail($email)
                ->setTitle($title)
                ->setPassword($password)
        )->getApprovalCode();
        $userId = $this->_client->ApproveRegistration(
            [],
            (new \Common\AuthApproveRegistrationPayload())
                ->setApprovalCode($approvalCode)
        )->getPersonId();
        $this->assertIsInt($userId);
        $user = \Frey\PersonPrimitive::findByEmail($this->_db, [$email]);
        $this->assertNotEmpty($user);
        $this->assertEquals($userId, $user[0]->getId());
    }

    public function testAuthorize()
    {
        $email = 'test@test.com';
        $password = '1234test!5678';
        $title = 'test testov';
        $approvalCode = $this->_client->RequestRegistration(
            [],
            (new \Common\AuthRequestRegistrationPayload())
                ->setEmail($email)
                ->setTitle($title)
                ->setPassword($password)
        )->getApprovalCode();
        $this->_client->ApproveRegistration(
            [],
            (new \Common\AuthApproveRegistrationPayload())
                ->setApprovalCode($approvalCode)
        )->getPersonId();
        $auth = $this->_client->Authorize(
            [],
            (new \Common\AuthAuthorizePayload())
                ->setEmail($email)
                ->setPassword($password)
        );
        $this->assertIsInt($auth->getPersonId());
        $this->assertIsString($auth->getAuthToken());
    }

    // TODO: is this method required at all?
    public function testQuickAuthorize()
    {
        $email = 'test@test.com';
        $password = '1234test!5678';
        $title = 'test testov';
        $approvalCode = $this->_client->RequestRegistration(
            [],
            (new \Common\AuthRequestRegistrationPayload())
                ->setEmail($email)
                ->setTitle($title)
                ->setPassword($password)
        )->getApprovalCode();
        $userId = $this->_client->ApproveRegistration(
            [],
            (new \Common\AuthApproveRegistrationPayload())
                ->setApprovalCode($approvalCode)
        )->getPersonId();
        $auth = $this->_client->Authorize(
            [],
            (new \Common\AuthAuthorizePayload())
                ->setEmail($email)
                ->setPassword($password)
        );

        $response = $this->_client->QuickAuthorize(
            [],
            (new \Common\AuthQuickAuthorizePayload())
                ->setPersonId($auth->getPersonId())
                ->setAuthToken($auth->getAuthToken())
        )->getAuthSuccess();
        $this->assertIsBool($response);
    }

    public function testChangePassword()
    {
        $email = 'test@test.com';
        $title = 'test testov';
        $password = '1234test!5678';
        $newPassword = '8765test!4321';
        $approvalCode = $this->_client->RequestRegistration(
            [],
            (new \Common\AuthRequestRegistrationPayload())
                ->setEmail($email)
                ->setTitle($title)
                ->setPassword($password)
        )->getApprovalCode();
        $this->_client->ApproveRegistration(
            [],
            (new \Common\AuthApproveRegistrationPayload())
                ->setApprovalCode($approvalCode)
        )->getPersonId();
        $this->_client->Authorize(
            [],
            (new \Common\AuthAuthorizePayload())
                ->setEmail($email)
                ->setPassword($password)
        );

        $this->_client->ChangePassword(
            [],
            (new \Common\AuthChangePasswordPayload())
                ->setEmail($email)
                ->setPassword($password)
                ->setNewPassword($newPassword)
        )->getAuthToken();
        $auth = $this->_client->Authorize(
            [],
            (new \Common\AuthAuthorizePayload())
                ->setEmail($email)
                ->setPassword($newPassword)
        );
        $this->assertIsString($auth->getAuthToken());
    }

    public function testRequestResetPassword()
    {
        $email = 'test@test.com';
        $password = '1234test!5678';
        $title = 'test testov';
        $approvalCode = $this->_client->RequestRegistration(
            [],
            (new \Common\AuthRequestRegistrationPayload())
                ->setEmail($email)
                ->setTitle($title)
                ->setPassword($password)
        )->getApprovalCode();
        $this->_client->ApproveRegistration(
            [],
            (new \Common\AuthApproveRegistrationPayload())
                ->setApprovalCode($approvalCode)
        )->getPersonId();
        $this->_client->Authorize(
            [],
            (new \Common\AuthAuthorizePayload())
                ->setEmail($email)
                ->setPassword($password)
        );

        $resetToken = $this->_client->RequestResetPassword(
            [],
            (new \Common\AuthRequestResetPasswordPayload())
                ->setEmail($email)
        )->getResetToken();
        $this->assertIsString($resetToken);
    }

    public function testApproveResetPassword()
    {
        $email = 'test@test.com';
        $password = '1234test!5678';
        $title = 'test testov';
        $approvalCode = $this->_client->RequestRegistration(
            [],
            (new \Common\AuthRequestRegistrationPayload())
                ->setEmail($email)
                ->setTitle($title)
                ->setPassword($password)
        )->getApprovalCode();
        $this->_client->ApproveRegistration(
            [],
            (new \Common\AuthApproveRegistrationPayload())
                ->setApprovalCode($approvalCode)
        )->getPersonId();
        $this->_client->Authorize(
            [],
            (new \Common\AuthAuthorizePayload())
                ->setEmail($email)
                ->setPassword($password)
        );

        $resetToken =  $this->_client->RequestResetPassword(
            [],
            (new \Common\AuthRequestResetPasswordPayload())
                ->setEmail($email)
        )->getResetToken();

        $newPassword = $this->_client->ApproveResetPassword(
            [],
            (new \Common\AuthApproveResetPasswordPayload())
                ->setEmail($email)
                ->setResetToken($resetToken)
        )->getNewTmpPassword();

        $this->assertIsString($newPassword);

        $this->_client->Authorize(
            [],
            (new \Common\AuthAuthorizePayload())
                ->setEmail($email)
                ->setPassword($newPassword)
        );
    }

    /**
     * @throws \Exception
     */
    public function testUpdatePersonalInfo()
    {
        $email = 'test@test.com';
        $title = 'test testov';
        $password = '1234test!5678';
        $approvalCode = $this->_client->RequestRegistration(
            [],
            (new \Common\AuthRequestRegistrationPayload())
                ->setEmail($email)
                ->setTitle($title)
                ->setPassword($password)
        )->getApprovalCode();
        $userId = $this->_client->ApproveRegistration(
            [],
            (new \Common\AuthApproveRegistrationPayload())
                ->setApprovalCode($approvalCode)
        )->getPersonId();

        $title = 'testuser';
        $city = 'testcity';
        $country = 'testcountry';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $success = $this->_client->UpdatePersonalInfo(
            [],
            (new \Common\PersonsUpdatePersonalInfoPayload())
                ->setId($userId)
                ->setTitle($title)
                ->setCountry($country)
                ->setCity($city)
                ->setEmail($email)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getSuccess();
        $this->assertIsBool($success);

        $user = \Frey\PersonPrimitive::findByEmail($this->_db, [$email]);
        $this->assertNotEmpty($user);
        $this->assertEquals($userId, $user[0]->getId());
        $this->assertEquals($email, $user[0]->getEmail());
        $this->assertEquals($title, $user[0]->getTitle());
        $this->assertEquals($city, $user[0]->getCity());
        $this->assertEquals($phone, $user[0]->getPhone());
        $this->assertEquals($tenhouId, $user[0]->getTenhouId());
    }

    public function testGetPersonalInfo()
    {
        $email = 'test@test.com';
        $password = '1234test!5678';
        $title = 'test testov';
        $approvalCode = $this->_client->RequestRegistration(
            [],
            (new \Common\AuthRequestRegistrationPayload())
                ->setEmail($email)
                ->setTitle($title)
                ->setPassword($password)
        )->getApprovalCode();
        $userId = $this->_client->ApproveRegistration(
            [],
            (new \Common\AuthApproveRegistrationPayload())
                ->setApprovalCode($approvalCode)
        )->getPersonId();

        $title = 'testuser';
        $city = 'testcity';
        $country = 'testcountry';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $this->_client->UpdatePersonalInfo(
            [],
            (new \Common\PersonsUpdatePersonalInfoPayload())
                ->setId($userId)
                ->setTitle($title)
                ->setCountry($country)
                ->setCity($city)
                ->setEmail($email)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getSuccess();

        $response = $this->_client->GetPersonalInfo(
            [],
            (new \Common\PersonsGetPersonalInfoPayload())
                ->setIds([$userId])
        )->getPeople();

        $this->assertNotEmpty($response);
        $this->assertNotEmpty($response[0]);
        $person = $response[0];
        $this->assertInstanceOf(\Common\PersonEx::class, $person);
        $this->assertEquals($userId, $person->getId());
        $this->assertIsInt($person->getId());
        $this->assertEquals($email, $person->getEmail());
        $this->assertIsString($person->getEmail());
        $this->assertEquals($title, $person->getTitle());
        $this->assertIsString($person->getTitle());
        $this->assertEquals($city, $person->getCity());
        $this->assertIsString($person->getCity());
        $this->assertEquals($phone, $person->getPhone());
        $this->assertIsString($person->getPhone());
        $this->assertEquals($tenhouId, $person->getTenhouId());
        $this->assertIsString($person->getTenhouId());
    }

    // TODO: testGetPersonalInfo with no admin rights should not output any personal data

    public function testFindByTitle()
    {
        $email = 'test@test.com';
        $title = 'test testov';
        $password = '1234test!5678';
        $approvalCode = $this->_client->RequestRegistration(
            [],
            (new \Common\AuthRequestRegistrationPayload())
                ->setEmail($email)
                ->setTitle($title)
                ->setPassword($password)
        )->getApprovalCode();
        $userId = $this->_client->ApproveRegistration(
            [],
            (new \Common\AuthApproveRegistrationPayload())
                ->setApprovalCode($approvalCode)
        )->getPersonId();

        $title = 'newtestuser';
        $city = 'testcity';
        $country = 'testcountry';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $this->_client->UpdatePersonalInfo(
            [],
            (new \Common\PersonsUpdatePersonalInfoPayload())
                ->setId($userId)
                ->setTitle($title)
                ->setCountry($country)
                ->setCity($city)
                ->setEmail($email)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getSuccess();

        $response = $this->_client->FindByTitle(
            [],
            (new \Common\PersonsFindByTitlePayload())
                ->setQuery('new')
        )->getPeople();

        $this->assertNotEmpty($response);
        $this->assertNotEmpty($response[0]);
        $person = $response[0];
        $this->assertInstanceOf(\Common\Person::class, $person);
        $this->assertEquals($userId, $person->getId());
        $this->assertIsInt($person->getId());
        $this->assertEquals($title, $person->getTitle());
        $this->assertIsString($person->getTitle());
        $this->assertEquals($city, $person->getCity());
        $this->assertIsString($person->getCity());
        $this->assertEquals($tenhouId, $person->getTenhouId());
        $this->assertIsString($person->getTenhouId());
    }

    /**
     * @throws \Exception
     */
    public function testCreateAccount()
    {
        $email = 'test@test.com';
        $password = '1234test!5678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->CreateAccount(
            [],
            (new \Common\PersonsCreateAccountPayload())
                ->setEmail($email)
                ->setPassword($password)
                ->setTitle($title)
                ->setCity($city)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getPersonId();
        $this->assertIsInt($userId);
        $user = \Frey\PersonPrimitive::findByEmail($this->_db, [$email]);
        $this->assertNotEmpty($user);
        $this->assertEquals($userId, $user[0]->getId());
    }

    /**
     * @throws \Exception
     */
    public function testCreateGroup()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '123456';

        $grpId = $this->_client->CreateGroup(
            [],
            (new \Common\PersonsCreateGroupPayload())
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getGroupId();

        $this->assertIsInt($grpId);
        $grp = \Frey\GroupPrimitive::findById($this->_db, [$grpId]);
        $this->assertNotEmpty($grp);
        $this->assertEquals($title, $grp[0]->getTitle());
    }

    public function testGetGroups()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->CreateGroup(
            [],
            (new \Common\PersonsCreateGroupPayload())
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getGroupId();

        $groups = $this->_client->GetGroups(
            [],
            (new \Common\PersonsGetGroupsPayload())
                ->setIds([$grpId])
        )->getGroups();

        $this->assertNotEmpty($groups);
        $this->assertNotEmpty($groups[0]);
        $group = $groups[0];
        $this->assertInstanceOf(\Common\Group::class, $group);
        $this->assertEquals($grpId, $group->getId());
        $this->assertIsInt($group->getId());
        $this->assertEquals($title, $group->getTitle());
        $this->assertIsString($group->getTitle());
        $this->assertEquals($description, $group->getDescription());
        $this->assertIsString($group->getDescription());
        $this->assertEquals($color, $group->getColor());
        $this->assertIsString($group->getColor());
    }

    /**
     * @throws \Exception
     */
    public function testUpdateGroup()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->CreateGroup(
            [],
            (new \Common\PersonsCreateGroupPayload())
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getGroupId();

        $success = $this->_client->UpdateGroup(
            [],
            (new \Common\PersonsUpdateGroupPayload())
                ->setGroupId($grpId)
                ->setTitle('newtestgrp')
                ->setDescription('newtestgrp_description')
                ->setColor('#654321')
        )->getSuccess();
        $this->assertTrue(!!$success);

        $grp = \Frey\GroupPrimitive::findById($this->_db, [$grpId]);
        $this->assertNotEmpty($grp);
        $this->assertEquals('newtestgrp', $grp[0]->getTitle());
        $this->assertEquals('newtestgrp_description', $grp[0]->getDescription());
        $this->assertEquals('#654321', $grp[0]->getLabelColor());
    }

    /**
     * @throws \Exception
     */
    public function testDeleteGroup()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '123456';

        $grpId = $this->_client->CreateGroup(
            [],
            (new \Common\PersonsCreateGroupPayload())
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getGroupId();

        $this->_client->DeleteGroup(
            [],
            (new \Common\PersonsDeleteGroupPayload())
                ->setGroupId($grpId)
        )->getSuccess();
        $grp = \Frey\GroupPrimitive::findById($this->_db, [$grpId]);
        $this->assertEmpty($grp);
    }

    /**
     * @throws \Exception
     */
    public function testAddPersonToGroup()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->CreateGroup(
            [],
            (new \Common\PersonsCreateGroupPayload())
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getGroupId();

        $email = 'test@test.com';
        $password = '12345678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->CreateAccount(
            [],
            (new \Common\PersonsCreateAccountPayload())
                ->setEmail($email)
                ->setPassword($password)
                ->setTitle($title)
                ->setCity($city)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getPersonId();

        $success = $this->_client->AddPersonToGroup(
            [],
            (new \Common\PersonsAddPersonToGroupPayload())
                ->setPersonId($userId)
                ->setGroupId($grpId)
        )->getSuccess();
        $this->assertTrue(!!$success);

        $grp = \Frey\GroupPrimitive::findById($this->_db, [$grpId]);
        $this->assertNotEmpty($grp[0]->getPersonIds());
        $this->assertEquals($userId, $grp[0]->getPersonIds()[0]);

        $person = \Frey\PersonPrimitive::findById($this->_db, [$userId]);
        $this->assertNotEmpty($person[0]->getGroupIds());
        $this->assertEquals($grpId, $person[0]->getGroupIds()[0]);
    }

    /**
     * @throws \Exception
     */
    public function testRemovePersonFromGroup()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->CreateGroup(
            [],
            (new \Common\PersonsCreateGroupPayload())
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getGroupId();

        $email = 'test@test.com';
        $password = '12345678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->CreateAccount(
            [],
            (new \Common\PersonsCreateAccountPayload())
                ->setEmail($email)
                ->setPassword($password)
                ->setTitle($title)
                ->setCity($city)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getPersonId();

        $this->_client->AddPersonToGroup(
            [],
            (new \Common\PersonsAddPersonToGroupPayload())
                ->setPersonId($userId)
                ->setGroupId($grpId)
        )->getSuccess();

        $success = $this->_client->RemovePersonFromGroup(
            [],
            (new \Common\PersonsRemovePersonFromGroupPayload())
                ->setPersonId($userId)
                ->setGroupId($grpId)
        )->getSuccess();

        $this->assertTrue(!!$success);
        $grp = \Frey\GroupPrimitive::findById($this->_db, [$grpId]);
        $this->assertEmpty($grp[0]->getPersonIds());
        $person = \Frey\PersonPrimitive::findById($this->_db, [$userId]);
        $this->assertEmpty($person[0]->getGroupIds());
    }

    public function testGetPersonsOfGroup()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->CreateGroup(
            [],
            (new \Common\PersonsCreateGroupPayload())
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getGroupId();

        $email = 'test@test.com';
        $password = '12345678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->CreateAccount(
            [],
            (new \Common\PersonsCreateAccountPayload())
                ->setEmail($email)
                ->setPassword($password)
                ->setTitle($title)
                ->setCity($city)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getPersonId();

        $this->_client->AddPersonToGroup(
            [],
            (new \Common\PersonsAddPersonToGroupPayload())
                ->setPersonId($userId)
                ->setGroupId($grpId)
        )->getSuccess();

        $response = $this->_client->GetPersonsOfGroup(
            [],
            (new \Common\PersonsGetPersonsOfGroupPayload())
                ->setGroupId($grpId)
        )->getPeople();

        $this->assertNotEmpty($response);
        $this->assertNotEmpty($response[0]);
        $person = $response[0];
        $this->assertInstanceOf(\Common\Person::class, $person);
        $this->assertEquals($userId, $person->getId());
        $this->assertIsInt($person->getId());
        $this->assertEquals($title, $person->getTitle());
        $this->assertIsString($person->getTitle());
        $this->assertEquals($city, $person->getCity());
        $this->assertIsString($person->getCity());
        $this->assertEquals($tenhouId, $person->getTenhouId());
        $this->assertIsString($person->getTenhouId());
    }

    public function testGetGroupsOfPerson()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->CreateAccount(
            [],
            (new \Common\PersonsCreateAccountPayload())
                ->setEmail($email)
                ->setPassword($password)
                ->setTitle($title)
                ->setCity($city)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getPersonId();

        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->CreateGroup(
            [],
            (new \Common\PersonsCreateGroupPayload())
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getGroupId();

        $this->_client->AddPersonToGroup(
            [],
            (new \Common\PersonsAddPersonToGroupPayload())
                ->setPersonId($userId)
                ->setGroupId($grpId)
        )->getSuccess();

        $groups = $this->_client->GetGroupsOfPerson(
            [],
            (new \Common\PersonsGetGroupsOfPersonPayload())
                ->setPersonId($userId)
        )->getGroups();

        $this->assertNotEmpty($groups);
        $this->assertNotEmpty($groups[0]);
        $group = $groups[0];
        $this->assertInstanceOf(\Common\Group::class, $group);
        $this->assertEquals($grpId, $group->getId());
        $this->assertIsInt($group->getId());
        $this->assertEquals($title, $group->getTitle());
        $this->assertIsString($group->getTitle());
        $this->assertEquals($description, $group->getDescription());
        $this->assertIsString($group->getDescription());
        $this->assertEquals($color, $group->getColor());
        $this->assertIsString($group->getColor());
    }

    /**
     * @throws \Exception
     */
    public function testAddRuleForPerson()
    {
        $email = 'test@test.com';
        $password = '1234test!5678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->CreateAccount(
            [],
            (new \Common\PersonsCreateAccountPayload())
                ->setEmail($email)
                ->setPassword($password)
                ->setTitle($title)
                ->setCity($city)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getPersonId();
        $eventId = self::CURRENT_EVENT_ID;

        $ruleId = $this->_client->AddRuleForPerson(
            [],
            (new \Common\AccessAddRuleForPersonPayload())
                ->setRuleName('testrule')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setPersonId($userId)
                ->setEventId($eventId)
        )->getRuleId();

        $this->assertIsInt($ruleId);
        $this->assertGreaterThan(0, $ruleId);

        $rule = \Frey\PersonAccessPrimitive::findById($this->_db, [$ruleId]);
        $this->assertNotEmpty($rule);
        $this->assertEquals('testrule', $rule[0]->getAclName());
        $this->assertEquals('testval', $rule[0]->getAclValue());
        $this->assertEquals(\Frey\AccessPrimitive::TYPE_ENUM, $rule[0]->getAclType());
    }

    /**
     * @throws \Exception
     */
    public function testAddRuleForGroup()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->CreateGroup(
            [],
            (new \Common\PersonsCreateGroupPayload())
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getGroupId();
        $eventId = self::CURRENT_EVENT_ID;

        $ruleId = $this->_client->AddRuleForGroup(
            [],
            (new \Common\AccessAddRuleForGroupPayload())
                ->setRuleName('testrule')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setGroupId($grpId)
                ->setEventId($eventId)
        )->getRuleId();

        $this->assertIsInt($ruleId);
        $this->assertGreaterThan(0, $ruleId);

        $rule = \Frey\GroupAccessPrimitive::findById($this->_db, [$ruleId]);
        $this->assertNotEmpty($rule);
        $this->assertEquals('testrule', $rule[0]->getAclName());
        $this->assertEquals('testval', $rule[0]->getAclValue());
        $this->assertEquals(\Frey\AccessPrimitive::TYPE_ENUM, $rule[0]->getAclType());
    }

    /**
     * @throws \Exception
     */
    public function testUpdateRuleForPerson()
    {
        $email = 'test@test.com';
        $password = '1234test!5678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->CreateAccount(
            [],
            (new \Common\PersonsCreateAccountPayload())
                ->setEmail($email)
                ->setPassword($password)
                ->setTitle($title)
                ->setCity($city)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getPersonId();
        $eventId = self::CURRENT_EVENT_ID;

        $ruleId = $this->_client->AddRuleForPerson(
            [],
            (new \Common\AccessAddRuleForPersonPayload())
                ->setRuleName('testrule')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setPersonId($userId)
                ->setEventId($eventId)
        )->getRuleId();

        $this->_client->UpdateRuleForPerson(
            [],
            (new \Common\AccessUpdateRuleForPersonPayload())
                ->setRuleId($ruleId)
                ->setRuleValue((new \Common\RuleValue())->setNumberValue(123))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_INT)
        )->getSuccess();

        $rule = \Frey\PersonAccessPrimitive::findById($this->_db, [$ruleId]);
        $this->assertNotEmpty($rule);
        $this->assertEquals('testrule', $rule[0]->getAclName());
        $this->assertEquals(123, $rule[0]->getAclValue());
        $this->assertEquals(\Frey\AccessPrimitive::TYPE_INT, $rule[0]->getAclType());
    }

    /**
     * @throws \Frey\InvalidParametersException
     * @throws \Exception
     */
    public function testUpdateRuleForGroup()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->CreateGroup(
            [],
            (new \Common\PersonsCreateGroupPayload())
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getGroupId();
        $eventId = self::CURRENT_EVENT_ID;

        $ruleId = $this->_client->AddRuleForGroup(
            [],
            (new \Common\AccessAddRuleForGroupPayload())
                ->setRuleName('testrule')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setGroupId($grpId)
                ->setEventId($eventId)
        )->getRuleId();

        $this->_client->UpdateRuleForGroup(
            [],
            (new \Common\AccessUpdateRuleForGroupPayload())
                ->setRuleId($ruleId)
                ->setRuleValue((new \Common\RuleValue())->setNumberValue(321))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_INT)
        )->getSuccess();

        $rule = \Frey\GroupAccessPrimitive::findById($this->_db, [$ruleId]);
        $this->assertNotEmpty($rule);
        $this->assertEquals('testrule', $rule[0]->getAclName());
        $this->assertEquals(321, $rule[0]->getAclValue());
        $this->assertEquals(\Frey\AccessPrimitive::TYPE_INT, $rule[0]->getAclType());
    }

    /**
     * @throws \Exception
     */
    public function testDeleteRuleForPerson()
    {
        $email = 'test@test.com';
        $password = '1234test!5678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->CreateAccount(
            [],
            (new \Common\PersonsCreateAccountPayload())
                ->setEmail($email)
                ->setPassword($password)
                ->setTitle($title)
                ->setCity($city)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getPersonId();
        $eventId = self::CURRENT_EVENT_ID;

        $ruleId = $this->_client->AddRuleForPerson(
            [],
            (new \Common\AccessAddRuleForPersonPayload())
                ->setRuleName('testrule')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setPersonId($userId)
                ->setEventId($eventId)
        )->getRuleId();

        $this->_client->DeleteRuleForPerson(
            [],
            (new \Common\AccessDeleteRuleForPersonPayload())
                ->setRuleId($ruleId)
        )->getSuccess();

        $rule = \Frey\PersonAccessPrimitive::findById($this->_db, [$ruleId]);
        $this->assertEmpty($rule);
    }

    /**
     * @throws \Exception
     */
    public function testDeleteRuleForGroup()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->CreateGroup(
            [],
            (new \Common\PersonsCreateGroupPayload())
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getGroupId();
        $eventId = self::CURRENT_EVENT_ID;

        $ruleId = $this->_client->AddRuleForGroup(
            [],
            (new \Common\AccessAddRuleForGroupPayload())
                ->setRuleName('testrule')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setGroupId($grpId)
                ->setEventId($eventId)
        )->getRuleId();

        $this->_client->DeleteRuleForGroup(
            [],
            (new \Common\AccessDeleteRuleForGroupPayload())
                ->setRuleId($ruleId)
        )->getSuccess();

        $rule = \Frey\GroupAccessPrimitive::findById($this->_db, [$ruleId]);
        $this->assertEmpty($rule);
    }

    /**
     * @throws \Frey\InvalidParametersException
     * @throws \Exception
     */
    public function testGetPersonAccess()
    {
        $email = 'test@test.com';
        $password = '1234test!5678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->CreateAccount(
            [],
            (new \Common\PersonsCreateAccountPayload())
                ->setEmail($email)
                ->setPassword($password)
                ->setTitle($title)
                ->setCity($city)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getPersonId();
        $eventId = self::CURRENT_EVENT_ID;

        $ruleIds = [
            $this->_client->AddRuleForPerson(
                [],
                (new \Common\AccessAddRuleForPersonPayload())
                    ->setRuleName('testrule1')
                    ->setRuleValue((new \Common\RuleValue())->setStringValue('testval1'))
                    ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                    ->setPersonId($userId)
                    ->setEventId($eventId)
            )->getRuleId(),
            $this->_client->AddRuleForPerson(
                [],
                (new \Common\AccessAddRuleForPersonPayload())
                    ->setRuleName('testrule2')
                    ->setRuleValue((new \Common\RuleValue())->setStringValue('testval2'))
                    ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                    ->setPersonId($userId)
                    ->setEventId($eventId)
            )->getRuleId()
        ];
        $rules = \Frey\PersonAccessPrimitive::findById($this->_db, $ruleIds);

        $response = $this->_client->GetPersonAccess(
            [],
            (new \Common\AccessGetPersonAccessPayload())
                ->setPersonId($userId)
                ->setEventId($eventId)
        )->getRules();

        $this->assertNotEmpty($response);
        $access = $response->getRules();
        $this->assertEquals(2, count($access));
        $rule1 = $access[$rules[0]->getAclName()];
        $rule2 = $access[$rules[1]->getAclName()];
        $this->assertInstanceOf(\Common\RuleValue::class, $rule1);
        $this->assertInstanceOf(\Common\RuleValue::class, $rule2);

        $this->assertEquals($rules[0]->getAclValue(), $rule1->getStringValue());
        $this->assertEquals($rules[1]->getAclValue(), $rule2->getStringValue());
    }

    /**
     * @throws \Frey\InvalidParametersException
     * @throws \Exception
     */
    public function testGetGroupAccess()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->CreateGroup(
            [],
            (new \Common\PersonsCreateGroupPayload())
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getGroupId();
        $eventId = self::CURRENT_EVENT_ID;

        $ruleIds = [
            $this->_client->AddRuleForGroup(
                [],
                (new \Common\AccessAddRuleForGroupPayload())
                    ->setRuleName('testrule1')
                    ->setRuleValue((new \Common\RuleValue())->setStringValue('testval1'))
                    ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                    ->setGroupId($grpId)
                    ->setEventId($eventId)
            )->getRuleId(),
            $this->_client->AddRuleForGroup(
                [],
                (new \Common\AccessAddRuleForGroupPayload())
                    ->setRuleName('testrule2')
                    ->setRuleValue((new \Common\RuleValue())->setStringValue('testval2'))
                    ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                    ->setGroupId($grpId)
                    ->setEventId($eventId)
            )->getRuleId()
        ];

        $rules = \Frey\GroupAccessPrimitive::findById($this->_db, $ruleIds);

        $response = $this->_client->GetGroupAccess(
            [],
            (new \Common\AccessGetGroupAccessPayload())
                ->setGroupId($grpId)
                ->setEventId($eventId)
        )->getRules();

        $this->assertNotEmpty($response);
        $access = $response->getRules();
        $this->assertEquals(2, count($access));
        $rule1 = $access[$rules[0]->getAclName()];
        $rule2 = $access[$rules[1]->getAclName()];
        $this->assertInstanceOf(\Common\RuleValue::class, $rule1);
        $this->assertInstanceOf(\Common\RuleValue::class, $rule2);

        $this->assertEquals($rules[0]->getAclValue(), $rule1->getStringValue());
        $this->assertEquals($rules[1]->getAclValue(), $rule2->getStringValue());
    }

    // Complex access

    public function testGetAccessRules()
    {
        $email = 'test@test.com';
        $password = '1234test!5678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->CreateAccount(
            [],
            (new \Common\PersonsCreateAccountPayload())
                ->setEmail($email)
                ->setPassword($password)
                ->setTitle($title)
                ->setCity($city)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getPersonId();
        $eventId = self::CURRENT_EVENT_ID;

        $this->_client->AddRuleForPerson(
            [],
            (new \Common\AccessAddRuleForPersonPayload())
                ->setRuleName('testrule1')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval1'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setPersonId($userId)
                ->setEventId($eventId)
        )->getRuleId();
        $this->_client->AddRuleForPerson(
            [],
            (new \Common\AccessAddRuleForPersonPayload())
                ->setRuleName('testrule2')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval2_p'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setPersonId($userId)
                ->setEventId($eventId)
        )->getRuleId();

        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->CreateGroup(
            [],
            (new \Common\PersonsCreateGroupPayload())
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getGroupId();
        $eventId = self::CURRENT_EVENT_ID;

        $this->_client->AddRuleForGroup(
            [],
            (new \Common\AccessAddRuleForGroupPayload())
                ->setRuleName('testrule2')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval2_g'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setGroupId($grpId)
                ->setEventId($eventId)
        )->getRuleId();
        $this->_client->AddRuleForGroup(
            [],
            (new \Common\AccessAddRuleForGroupPayload())
                ->setRuleName('testrule3')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval3'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setGroupId($grpId)
                ->setEventId($eventId)
        )->getRuleId();

        $this->_client->AddPersonToGroup(
            [],
            (new \Common\PersonsAddPersonToGroupPayload())
                ->setPersonId($userId)
                ->setGroupId($grpId)
        )->getSuccess();

        $response = $this->_client->GetAccessRules(
            [],
            (new \Common\AccessGetAccessRulesPayload())
                ->setPersonId($userId)
                ->setEventId($eventId)
        )->getRules();

        $this->assertNotEmpty($response);
        $access = $response->getRules();
        // Note: this SHOULD be 3, not 4. But as we're setting a CREATE_EVENT rule forcefully for all users
        // in tests, it should be increased by 1 here.
        $this->assertEquals(4, count($access));
        $rule1 = $access['testrule1'];
        $rule2 = $access['testrule2'];
        $rule3 = $access['testrule3'];
        $this->assertInstanceOf(\Common\RuleValue::class, $rule1);
        $this->assertInstanceOf(\Common\RuleValue::class, $rule2);
        $this->assertInstanceOf(\Common\RuleValue::class, $rule3);
        $this->assertEquals('testval1', $rule1->getStringValue());
        $this->assertEquals('testval2_p', $rule2->getStringValue());
        $this->assertEquals('testval3', $rule3->getStringValue());
    }

    public function testGetRuleValue()
    {
        $email = 'test@test.com';
        $password = '1234test!5678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->CreateAccount(
            [],
            (new \Common\PersonsCreateAccountPayload())
                ->setEmail($email)
                ->setPassword($password)
                ->setTitle($title)
                ->setCity($city)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getPersonId();
        $eventId = self::CURRENT_EVENT_ID;

        $this->_client->AddRuleForPerson(
            [],
            (new \Common\AccessAddRuleForPersonPayload())
                ->setRuleName('testrule1')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval1'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setPersonId($userId)
                ->setEventId($eventId)
        )->getRuleId();
        $this->_client->AddRuleForPerson(
            [],
            (new \Common\AccessAddRuleForPersonPayload())
                ->setRuleName('testrule2')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval2_p'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setPersonId($userId)
                ->setEventId($eventId)
        )->getRuleId();

        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '123456';

        $grpId = $this->_client->CreateGroup(
            [],
            (new \Common\PersonsCreateGroupPayload())
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getGroupId();
        $eventId = self::CURRENT_EVENT_ID;

        $this->_client->AddRuleForGroup(
            [],
            (new \Common\AccessAddRuleForGroupPayload())
                ->setRuleName('testrule1')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval2_g'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setGroupId($grpId)
                ->setEventId($eventId)
        )->getRuleId();
        $this->_client->AddRuleForGroup(
            [],
            (new \Common\AccessAddRuleForGroupPayload())
                ->setRuleName('testrule3')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval3'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setGroupId($grpId)
                ->setEventId($eventId)
        )->getRuleId();

        $this->_client->AddPersonToGroup(
            [],
            (new \Common\PersonsAddPersonToGroupPayload())
                ->setPersonId($userId)
                ->setGroupId($grpId)
        )->getSuccess();

        $val = $this->_client->GetRuleValue(
            [],
            (new \Common\AccessGetRuleValuePayload())
                ->setPersonId($userId)
                ->setEventId($eventId)
                ->setRuleName('testrule2')
        )->getValue();

        $this->assertNotEmpty($val);
        $this->assertEquals('testval2_p', $val->getStringValue());
    }

    public function testClearAccessCache()
    {
        $email = 'test@test.com';
        $password = '1234test!5678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->CreateAccount(
            [],
            (new \Common\PersonsCreateAccountPayload())
                ->setEmail($email)
                ->setPassword($password)
                ->setTitle($title)
                ->setCity($city)
                ->setPhone($phone)
                ->setTenhouId($tenhouId)
        )->getPersonId();
        $eventId = self::CURRENT_EVENT_ID;

        $this->_client->AddRuleForPerson(
            [],
            (new \Common\AccessAddRuleForPersonPayload())
                ->setRuleName('testrule1')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval1'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setPersonId($userId)
                ->setEventId($eventId)
        )->getRuleId();
        $personRuleId = $this->_client->AddRuleForPerson(
            [],
            (new \Common\AccessAddRuleForPersonPayload())
                ->setRuleName('testrule2')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval2_p'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setPersonId($userId)
                ->setEventId($eventId)
        )->getRuleId();

        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->CreateGroup(
            [],
            (new \Common\PersonsCreateGroupPayload())
                ->setTitle($title)
                ->setDescription($description)
                ->setColor($color)
        )->getGroupId();
        $eventId = self::CURRENT_EVENT_ID;

        $this->_client->AddRuleForGroup(
            [],
            (new \Common\AccessAddRuleForGroupPayload())
                ->setRuleName('testrule2')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval2_g'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setGroupId($grpId)
                ->setEventId($eventId)
        )->getRuleId();

        $groupRuleId = $this->_client->AddRuleForGroup(
            [],
            (new \Common\AccessAddRuleForGroupPayload())
                ->setRuleName('testrule3')
                ->setRuleValue((new \Common\RuleValue())->setStringValue('testval3'))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_ENUM)
                ->setGroupId($grpId)
                ->setEventId($eventId)
        )->getRuleId();

        $this->_client->AddPersonToGroup(
            [],
            (new \Common\PersonsAddPersonToGroupPayload())
                ->setPersonId($userId)
                ->setGroupId($grpId)
        )->getSuccess();

        $val = $this->_client->GetRuleValue(
            [],
            (new \Common\AccessGetRuleValuePayload())
                ->setPersonId($userId)
                ->setEventId($eventId)
                ->setRuleName('testrule2')
        )->getValue();
        $this->assertEquals('testval2_p', $val->getStringValue());
        $val = $this->_client->GetRuleValue(
            [],
            (new \Common\AccessGetRuleValuePayload())
                ->setPersonId($userId)
                ->setEventId($eventId)
                ->setRuleName('testrule3')
        )->getValue();
        $this->assertEquals('testval3', $val->getStringValue());

        $this->_client->UpdateRuleForPerson(
            [],
            (new \Common\AccessUpdateRuleForPersonPayload())
                ->setRuleId($personRuleId)
                ->setRuleValue((new \Common\RuleValue())->setNumberValue(123))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_INT)
        )->getSuccess();

        $this->_client->UpdateRuleForGroup(
            [],
            (new \Common\AccessUpdateRuleForGroupPayload())
                ->setRuleId($groupRuleId)
                ->setRuleValue((new \Common\RuleValue())->setNumberValue(321))
                ->setRuleType(\Frey\AccessPrimitive::TYPE_INT)
        )->getSuccess();

        // Should be same before cache clear...
        $val = $this->_client->GetRuleValue(
            [],
            (new \Common\AccessGetRuleValuePayload())
                ->setPersonId($userId)
                ->setEventId($eventId)
                ->setRuleName('testrule2')
        )->getValue();
        $this->assertEquals('testval2_p', $val->getStringValue());
        $val = $this->_client->GetRuleValue(
            [],
            (new \Common\AccessGetRuleValuePayload())
                ->setPersonId($userId)
                ->setEventId($eventId)
                ->setRuleName('testrule3')
        )->getValue();
        $this->assertEquals('testval3', $val->getStringValue());

        $this->_client->ClearAccessCache(
            [],
            (new \Common\AccessClearAccessCachePayload())
                ->setPersonId($userId)
                ->setEventId($eventId)
        )->getSuccess();

        // Should be updated after cache clear...
        $val = $this->_client->GetRuleValue(
            [],
            (new \Common\AccessGetRuleValuePayload())
                ->setPersonId($userId)
                ->setEventId($eventId)
                ->setRuleName('testrule2')
        )->getValue();
        $this->assertEquals(123, $val->getNumberValue());
        $val = $this->_client->GetRuleValue(
            [],
            (new \Common\AccessGetRuleValuePayload())
                ->setPersonId($userId)
                ->setEventId($eventId)
                ->setRuleName('testrule3')
        )->getValue();
        $this->assertEquals(321, $val->getNumberValue());
    }
}
