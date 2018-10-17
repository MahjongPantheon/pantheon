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
use JsonRPC\Client;

/**
 * Class RealApiTest: integration test suite
 * @package Frey
 */
class RealApiTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @var Client
     */
    protected $_client;
    /**
     * @var Db
     */
    protected $_db;

    const CURRENT_EVENT_ID = 123;

    /**
     * @throws \Exception
     */
    public function setUp()
    {
        // Init db! Or bunch of PDOExceptions will appeal
        $this->_db = Db::__getCleanTestingInstance();

        $this->_client = new Client('http://localhost:1359');
        $this->_client->getHttpClient()->withHeaders([
            'X-Auth-Token: 198vdsh904hfbnkjv98whb2iusvd98b29bsdv98svbr9wghj',
            'X-Current-Event-Id: ' . self::CURRENT_EVENT_ID
        ]);
        //$this->_client->getHttpClient()->withDebug();
    }

    /**
     * @throws \Exception
     */
    public function testRequestRegistration()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $approvalCode = $this->_client->execute('requestRegistration', [$email, $password]);
        $this->assertInternalType('string', $approvalCode);
    }

    /**
     * @throws \Exception
     */
    public function testApproveRegistration()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $approvalCode = $this->_client->execute('requestRegistration', [$email, $password]);
        $userId = $this->_client->execute('approveRegistration', [$approvalCode]);
        $this->assertInternalType('int', $userId);
        $user = PersonPrimitive::findByEmail($this->_db, [$email]);
        $this->assertNotEmpty($user);
        $this->assertEquals($userId, $user[0]->getId());
    }

    public function testAuthorize()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $approvalCode = $this->_client->execute('requestRegistration', [$email, $password]);
        $this->_client->execute('approveRegistration', [$approvalCode]);
        $token = $this->_client->execute('authorize', [$email, $password]);
        $this->assertInternalType('string', $token);
    }

    // TODO: is this method required at all?
    public function testQuickAuthorize()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $approvalCode = $this->_client->execute('requestRegistration', [$email, $password]);
        $userId = $this->_client->execute('approveRegistration', [$approvalCode]);
        $token = $this->_client->execute('authorize', [$email, $password]);

        $response = $this->_client->execute('quickAuthorize', [$userId, $token]);
        $this->assertInternalType('bool', $response);
    }

    public function testChangePassword()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $newPassword = '87654321';
        $approvalCode = $this->_client->execute('requestRegistration', [$email, $password]);
        $this->_client->execute('approveRegistration', [$approvalCode]);
        $this->_client->execute('authorize', [$email, $password]);

        $this->_client->execute('changePassword', [$email, $password, $newPassword]);
        $newToken = $this->_client->execute('authorize', [$email, $newPassword]);
        $this->assertInternalType('string', $newToken);
    }

    public function testRequestResetPassword()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $approvalCode = $this->_client->execute('requestRegistration', [$email, $password]);
        $this->_client->execute('approveRegistration', [$approvalCode]);
        $this->_client->execute('authorize', [$email, $password]);

        $resetToken = $this->_client->execute('requestResetPassword', [$email]);
        $this->assertInternalType('string', $resetToken);
    }

    public function testApproveResetPassword()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $approvalCode = $this->_client->execute('requestRegistration', [$email, $password]);
        $this->_client->execute('approveRegistration', [$approvalCode]);
        $this->_client->execute('authorize', [$email, $password]);

        $resetToken = $this->_client->execute('requestResetPassword', [$email]);
        $newPassword = $this->_client->execute('approveResetPassword', [$email, $resetToken]);
        $this->assertInternalType('string', $newPassword);

        $this->_client->execute('authorize', [$email, $newPassword]);
    }

    /**
     * @throws \Exception
     */
    public function testUpdatePersonalInfo()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $approvalCode = $this->_client->execute('requestRegistration', [$email, $password]);
        $userId = $this->_client->execute('approveRegistration', [$approvalCode]);

        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $success = $this->_client->execute('updatePersonalInfo', [
            $userId, $title, $city, $email, $phone, $tenhouId
        ]);
        $this->assertInternalType('bool', $success);

        $user = PersonPrimitive::findByEmail($this->_db, [$email]);
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
        $password = '12345678';
        $approvalCode = $this->_client->execute('requestRegistration', [$email, $password]);
        $userId = $this->_client->execute('approveRegistration', [$approvalCode]);

        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $this->_client->execute('updatePersonalInfo', [
            $userId, $title, $city, $email, $phone, $tenhouId
        ]);

        $response = $this->_client->execute('getPersonalInfo', [[$userId]]);
        $this->assertNotEmpty($response);
        $this->assertNotEmpty($response[0]);
        $this->assertEquals($userId, $response[0]['id']);
        $this->assertInternalType('int', $response[0]['id']);
        $this->assertEquals($email, $response[0]['email']);
        $this->assertInternalType('string', $response[0]['email']);
        $this->assertEquals($title, $response[0]['title']);
        $this->assertInternalType('string', $response[0]['title']);
        $this->assertEquals($city, $response[0]['city']);
        $this->assertInternalType('string', $response[0]['city']);
        $this->assertEquals($phone, $response[0]['phone']);
        $this->assertInternalType('string', $response[0]['phone']);
        $this->assertEquals($tenhouId, $response[0]['tenhou_id']);
        $this->assertInternalType('string', $response[0]['tenhou_id']);
    }

    // TODO: testGetPersonalInfo with no admin rights should not output any personal data

    public function testFindByTitle()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $approvalCode = $this->_client->execute('requestRegistration', [$email, $password]);
        $userId = $this->_client->execute('approveRegistration', [$approvalCode]);

        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $this->_client->execute('updatePersonalInfo', [
            $userId, $title, $city, $email, $phone, $tenhouId
        ]);

        $response = $this->_client->execute('findByTitle', ['use']);
        $this->assertNotEmpty($response);
        $this->assertNotEmpty($response[0]);
        $this->assertEquals($userId, $response[0]['id']);
        $this->assertInternalType('int', $response[0]['id']);
        $this->assertEquals($title, $response[0]['title']);
        $this->assertInternalType('string', $response[0]['title']);
        $this->assertEquals($city, $response[0]['city']);
        $this->assertInternalType('string', $response[0]['city']);
        $this->assertEquals($tenhouId, $response[0]['tenhou_id']);
        $this->assertInternalType('string', $response[0]['tenhou_id']);
    }

    /**
     * @throws \Exception
     */
    public function testCreateAccount()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->execute('createAccount', [
            $email, $password, $title,
            $city, $phone, $tenhouId
        ]);
        $this->assertInternalType('int', $userId);
        $user = PersonPrimitive::findByEmail($this->_db, [$email]);
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

        $grpId = $this->_client->execute('createGroup', [
            $title, $description, $color
        ]);

        $this->assertInternalType('int', $grpId);
        $grp = GroupPrimitive::findById($this->_db, [$grpId]);
        $this->assertNotEmpty($grp);
        $this->assertEquals($title, $grp[0]->getTitle());
    }

    public function testGetGroups()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->execute('createGroup', [
            $title, $description, $color
        ]);

        $groups = $this->_client->execute('getGroups', [[$grpId]]);
        $this->assertNotEmpty($groups);
        $this->assertEquals($title, $groups[0]['title']);
        $this->assertInternalType('string', $groups[0]['title']);
        $this->assertEquals($description, $groups[0]['description']);
        $this->assertInternalType('string', $groups[0]['description']);
        $this->assertEquals($color, $groups[0]['label_color']);
        $this->assertInternalType('string', $groups[0]['label_color']);
        $this->assertEquals($grpId, $groups[0]['id']);
        $this->assertInternalType('int', $groups[0]['id']);
    }

    /**
     * @throws \Exception
     */
    public function testUpdateGroup()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->execute('createGroup', [
            $title, $description, $color
        ]);

        $success = $this->_client->execute('updateGroup', [
            $grpId, 'newtestgrp', 'newtestgrp_description', '#654321'
        ]);
        $this->assertTrue(!!$success);

        $grp = GroupPrimitive::findById($this->_db, [$grpId]);
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

        $grpId = $this->_client->execute('createGroup', [
            $title, $description, $color
        ]);

        $this->_client->execute('deleteGroup', [$grpId]);
        $grp = GroupPrimitive::findById($this->_db, [$grpId]);
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

        $grpId = $this->_client->execute('createGroup', [
            $title, $description, $color
        ]);

        $email = 'test@test.com';
        $password = '12345678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->execute('createAccount', [
            $email, $password, $title,
            $city, $phone, $tenhouId
        ]);


        $success = $this->_client->execute('addPersonToGroup', [$userId, $grpId]);
        $this->assertTrue(!!$success);

        $grp = GroupPrimitive::findById($this->_db, [$grpId]);
        $this->assertNotEmpty($grp[0]->getPersonIds());
        $this->assertEquals($userId, $grp[0]->getPersonIds()[0]);

        $person = PersonPrimitive::findById($this->_db, [$userId]);
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

        $grpId = $this->_client->execute('createGroup', [
            $title, $description, $color
        ]);

        $email = 'test@test.com';
        $password = '12345678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->execute('createAccount', [
            $email, $password, $title,
            $city, $phone, $tenhouId
        ]);


        $this->_client->execute('addPersonToGroup', [$userId, $grpId]);
        $success = $this->_client->execute('removePersonFromGroup', [$userId, $grpId]);
        $this->assertTrue(!!$success);

        $grp = GroupPrimitive::findById($this->_db, [$grpId]);
        $this->assertEmpty($grp[0]->getPersonIds());
        $person = PersonPrimitive::findById($this->_db, [$userId]);
        $this->assertEmpty($person[0]->getGroupIds());
    }

    public function testGetPersonsOfGroup()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->execute('createGroup', [
            $title, $description, $color
        ]);

        $email = 'test@test.com';
        $password = '12345678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->execute('createAccount', [
            $email, $password, $title,
            $city, $phone, $tenhouId
        ]);

        $this->_client->execute('addPersonToGroup', [$userId, $grpId]);

        $persons = $this->_client->execute('getPersonsOfGroup', [$grpId]);
        $this->assertNotEmpty($persons);
        $this->assertEquals($title, $persons[0]['title']);
        $this->assertInternalType('string', $persons[0]['title']);
        $this->assertEquals($city, $persons[0]['city']);
        $this->assertInternalType('string', $persons[0]['city']);
        $this->assertEquals($tenhouId, $persons[0]['tenhou_id']);
        $this->assertInternalType('string', $persons[0]['tenhou_id']);
        $this->assertEquals($userId, $persons[0]['id']);
        $this->assertInternalType('int', $persons[0]['id']);
    }

    public function testGetGroupsOfPerson()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->execute('createAccount', [
            $email, $password, $title,
            $city, $phone, $tenhouId
        ]);

        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->execute('createGroup', [
            $title, $description, $color
        ]);

        $this->_client->execute('addPersonToGroup', [$userId, $grpId]);

        $groups = $this->_client->execute('getGroupsOfPerson', [$userId]);

        $this->assertNotEmpty($groups);
        $this->assertEquals($title, $groups[0]['title']);
        $this->assertInternalType('string', $groups[0]['title']);
        $this->assertEquals($description, $groups[0]['description']);
        $this->assertInternalType('string', $groups[0]['description']);
        $this->assertEquals($color, $groups[0]['label_color']);
        $this->assertInternalType('string', $groups[0]['label_color']);
        $this->assertEquals($grpId, $groups[0]['id']);
        $this->assertInternalType('int', $groups[0]['id']);
    }

    /**
     * @throws \Exception
     */
    public function testAddRuleForPerson()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->execute('createAccount', [
            $email, $password, $title,
            $city, $phone, $tenhouId
        ]);
        $eventId = self::CURRENT_EVENT_ID;

        $ruleId = $this->_client->execute('addRuleForPerson', [
            'testrule', 'testval', AccessPrimitive::TYPE_ENUM,
            $userId, $eventId
        ]);
        $this->assertInternalType('int', $ruleId);
        $this->assertGreaterThan(0, $ruleId);

        $rule = PersonAccessPrimitive::findById($this->_db, [$ruleId]);
        $this->assertNotEmpty($rule);
        $this->assertEquals('testrule', $rule[0]->getAclName());
        $this->assertEquals('testval', $rule[0]->getAclValue());
        $this->assertEquals(AccessPrimitive::TYPE_ENUM, $rule[0]->getAclType());
    }

    /**
     * @throws \Exception
     */
    public function testAddRuleForGroup()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->execute('createGroup', [
            $title, $description, $color
        ]);
        $eventId = self::CURRENT_EVENT_ID;

        $ruleId = $this->_client->execute('addRuleForGroup', [
            'testrule', 'testval', AccessPrimitive::TYPE_ENUM,
            $grpId, $eventId
        ]);

        $this->assertInternalType('int', $ruleId);
        $this->assertGreaterThan(0, $ruleId);

        $rule = GroupAccessPrimitive::findById($this->_db, [$ruleId]);
        $this->assertNotEmpty($rule);
        $this->assertEquals('testrule', $rule[0]->getAclName());
        $this->assertEquals('testval', $rule[0]->getAclValue());
        $this->assertEquals(AccessPrimitive::TYPE_ENUM, $rule[0]->getAclType());
    }

    /**
     * @throws \Exception
     */
    public function testUpdateRuleForPerson()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->execute('createAccount', [
            $email, $password, $title,
            $city, $phone, $tenhouId
        ]);
        $eventId = self::CURRENT_EVENT_ID;

        $ruleId = $this->_client->execute('addRuleForPerson', [
            'testrule', 'testval', AccessPrimitive::TYPE_ENUM,
            $userId, $eventId
        ]);

        $this->_client->execute('updateRuleForPerson', [
            $ruleId, self::CURRENT_EVENT_ID, AccessPrimitive::TYPE_INT
        ]);

        $rule = PersonAccessPrimitive::findById($this->_db, [$ruleId]);
        $this->assertNotEmpty($rule);
        $this->assertEquals('testrule', $rule[0]->getAclName());
        $this->assertEquals(123, $rule[0]->getAclValue());
        $this->assertEquals(AccessPrimitive::TYPE_INT, $rule[0]->getAclType());
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testUpdateRuleForGroup()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->execute('createGroup', [
            $title, $description, $color
        ]);
        $eventId = self::CURRENT_EVENT_ID;

        $ruleId = $this->_client->execute('addRuleForGroup', [
            'testrule', 'testval', AccessPrimitive::TYPE_ENUM,
            $grpId, $eventId
        ]);

        $this->_client->execute('updateRuleForGroup', [
            $ruleId, 321, AccessPrimitive::TYPE_INT
        ]);

        $rule = GroupAccessPrimitive::findById($this->_db, [$ruleId]);
        $this->assertNotEmpty($rule);
        $this->assertEquals('testrule', $rule[0]->getAclName());
        $this->assertEquals(321, $rule[0]->getAclValue());
        $this->assertEquals(AccessPrimitive::TYPE_INT, $rule[0]->getAclType());
    }

    /**
     * @throws \Exception
     */
    public function testDeleteRuleForPerson()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->execute('createAccount', [
            $email, $password, $title,
            $city, $phone, $tenhouId
        ]);
        $eventId = self::CURRENT_EVENT_ID;

        $ruleId = $this->_client->execute('addRuleForPerson', [
            'testrule', 'testval', AccessPrimitive::TYPE_ENUM,
            $userId, $eventId
        ]);

        $this->_client->execute('deleteRuleForPerson', [$ruleId]);

        $rule = PersonAccessPrimitive::findById($this->_db, [$ruleId]);
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

        $grpId = $this->_client->execute('createGroup', [
            $title, $description, $color
        ]);
        $eventId = self::CURRENT_EVENT_ID;

        $ruleId = $this->_client->execute('addRuleForGroup', [
            'testrule', 'testval', AccessPrimitive::TYPE_ENUM,
            $grpId, $eventId
        ]);

        $this->_client->execute('deleteRuleForGroup', [$ruleId]);

        $rule = GroupAccessPrimitive::findById($this->_db, [$ruleId]);
        $this->assertEmpty($rule);
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testGetPersonAccess()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->execute('createAccount', [
            $email, $password, $title,
            $city, $phone, $tenhouId
        ]);
        $eventId = self::CURRENT_EVENT_ID;

        $ruleIds = [
            $this->_client->execute('addRuleForPerson', [
                'testrule1', 'testval1', AccessPrimitive::TYPE_ENUM,
                $userId, $eventId
            ]),
            $this->_client->execute('addRuleForPerson', [
                'testrule2', 'testval2', AccessPrimitive::TYPE_ENUM,
                $userId, $eventId
            ])
        ];
        $rules = PersonAccessPrimitive::findById($this->_db, $ruleIds);

        /** @var array $access */
        $access = $this->_client->execute('getPersonAccess', [$userId, $eventId]);
        $this->assertEquals(2, count($access));
        $this->assertEquals($rules[0]->getAclValue(), $access[$rules[0]->getAclName()]);
        $this->assertEquals($rules[1]->getAclValue(), $access[$rules[1]->getAclName()]);
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testGetGroupAccess()
    {
        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->execute('createGroup', [
            $title, $description, $color
        ]);
        $eventId = self::CURRENT_EVENT_ID;

        $ruleIds = [
            $this->_client->execute('addRuleForGroup', [
                'testrule1', 'testval1', AccessPrimitive::TYPE_ENUM,
                $grpId, $eventId
            ]),
            $this->_client->execute('addRuleForGroup', [
                'testrule2', 'testval2', AccessPrimitive::TYPE_ENUM,
                $grpId, $eventId
            ])
        ];

        $rules = GroupAccessPrimitive::findById($this->_db, $ruleIds);

        /** @var array $access */
        $access = $this->_client->execute('getGroupAccess', [$grpId, $eventId]);
        $this->assertEquals(2, count($access));
        $this->assertEquals($rules[0]->getAclValue(), $access[$rules[0]->getAclName()]);
        $this->assertEquals($rules[1]->getAclValue(), $access[$rules[1]->getAclName()]);
    }

    // Complex access

    public function testGetAccessRules()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->execute('createAccount', [
            $email, $password, $title,
            $city, $phone, $tenhouId
        ]);
        $eventId = self::CURRENT_EVENT_ID;

        $this->_client->execute('addRuleForPerson', [
            'testrule1', 'testval1', AccessPrimitive::TYPE_ENUM,
            $userId, $eventId
        ]);
        $this->_client->execute('addRuleForPerson', [
            'testrule2', 'testval2_p', AccessPrimitive::TYPE_ENUM,
            $userId, $eventId
        ]);

        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->execute('createGroup', [
            $title, $description, $color
        ]);
        $eventId = self::CURRENT_EVENT_ID;

        $this->_client->execute('addRuleForGroup', [
            'testrule1', 'testval2_g', AccessPrimitive::TYPE_ENUM,
            $grpId, $eventId
        ]);
        $this->_client->execute('addRuleForGroup', [
            'testrule3', 'testval3', AccessPrimitive::TYPE_ENUM,
            $grpId, $eventId
        ]);

        $this->_client->execute('addPersonToGroup', [$userId, $grpId]);

        /** @var array $rules */
        $rules = $this->_client->execute('getAccessRules', [$userId, $eventId]);
        $this->assertEquals(3, count($rules));
        $this->assertEquals('testval1', $rules['testrule1']);
        $this->assertEquals('testval2_p', $rules['testrule2']);
        $this->assertEquals('testval3', $rules['testrule3']);
    }

    public function testGetRuleValue()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->execute('createAccount', [
            $email, $password, $title,
            $city, $phone, $tenhouId
        ]);
        $eventId = self::CURRENT_EVENT_ID;

        $this->_client->execute('addRuleForPerson', [
            'testrule1', 'testval1', AccessPrimitive::TYPE_ENUM,
            $userId, $eventId
        ]);
        $this->_client->execute('addRuleForPerson', [
            'testrule2', 'testval2_p', AccessPrimitive::TYPE_ENUM,
            $userId, $eventId
        ]);

        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '123456';

        $grpId = $this->_client->execute('createGroup', [
            $title, $description, $color
        ]);
        $eventId = self::CURRENT_EVENT_ID;

        $this->_client->execute('addRuleForGroup', [
            'testrule2', 'testval2_g', AccessPrimitive::TYPE_ENUM,
            $grpId, $eventId
        ]);
        $this->_client->execute('addRuleForGroup', [
            'testrule3', 'testval3', AccessPrimitive::TYPE_ENUM,
            $grpId, $eventId
        ]);

        $this->_client->execute('addPersonToGroup', [$userId, $grpId]);

        $val = $this->_client->execute('getRuleValue', [$userId, $eventId, 'testrule2']);
        $this->assertEquals('testval2_p', $val);
    }

    public function testClearAccessCache()
    {
        $email = 'test@test.com';
        $password = '12345678';
        $title = 'testuser';
        $city = 'testcity';
        $phone = '123-456-7890';
        $tenhouId = 'testid';

        $userId = $this->_client->execute('createAccount', [
            $email, $password, $title,
            $city, $phone, $tenhouId
        ]);
        $eventId = self::CURRENT_EVENT_ID;

        $personRuleIds = [
            $this->_client->execute('addRuleForPerson', [
                'testrule1', 'testval1', AccessPrimitive::TYPE_ENUM,
                $userId, $eventId
            ]),
            $this->_client->execute('addRuleForPerson', [
                'testrule2', 'testval2_p', AccessPrimitive::TYPE_ENUM,
                $userId, $eventId
            ])
        ];

        $title = 'testgrp';
        $description = 'testgrp_description';
        $color = '#123456';

        $grpId = $this->_client->execute('createGroup', [
            $title, $description, $color
        ]);
        $eventId = self::CURRENT_EVENT_ID;

        $groupRuleIds = [
            $this->_client->execute('addRuleForGroup', [
                'testrule2', 'testval2_g', AccessPrimitive::TYPE_ENUM,
                $grpId, $eventId
            ]),
            $this->_client->execute('addRuleForGroup', [
                'testrule3', 'testval3', AccessPrimitive::TYPE_ENUM,
                $grpId, $eventId
            ])
        ];

        $this->_client->execute('addPersonToGroup', [$userId, $grpId]);

        $val = $this->_client->execute('getRuleValue', [$userId, $eventId, 'testrule2']);
        $this->assertEquals('testval2_p', $val);
        $val = $this->_client->execute('getRuleValue', [$userId, $eventId, 'testrule3']);
        $this->assertEquals('testval3', $val);

        $this->_client->execute('updateRuleForPerson', [
            $personRuleIds[1], 123, AccessPrimitive::TYPE_INT
        ]);
        $this->_client->execute('updateRuleForGroup', [
            $groupRuleIds[1], 321, AccessPrimitive::TYPE_INT
        ]);

        // Should be same before cache clear...
        $val = $this->_client->execute('getRuleValue', [$userId, $eventId, 'testrule2']);
        $this->assertEquals('testval2_p', $val);
        $val = $this->_client->execute('getRuleValue', [$userId, $eventId, 'testrule3']);
        $this->assertEquals('testval3', $val);

        $this->_client->execute('clearAccessCache', [$userId, $eventId]);

        // Should be updated after cache clear...
        $val = $this->_client->execute('getRuleValue', [$userId, $eventId, 'testrule2']);
        $this->assertEquals(123, $val);
        $val = $this->_client->execute('getRuleValue', [$userId, $eventId, 'testrule3']);
        $this->assertEquals(321, $val);
    }
}
