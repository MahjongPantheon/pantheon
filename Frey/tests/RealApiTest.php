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

require_once __DIR__ . '/../src/Db.php';
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

    public function setUp()
    {
        // Init db! Or bunch of PDOExceptions will appeal
        $db = Db::__getCleanTestingInstance();

        $this->_client = new Client('http://localhost:1359');
        // $this->_client->getHttpClient()->withDebug();
        $this->_client->getHttpClient()->withHeaders(['X-Auth-Token: 198vdsh904hfbnkjv98whb2iusvd98b29bsdv98svbr9wghj']);
    }

    public function testRequestRegistration()
    {
        $this->_client->execute('requestRegistration', [$email, $password]);
    }

    public function testApproveRegistration()
    {
        $this->_client->execute('approveRegistration', [$approvalCode]);
    }

    public function testAuthorize()
    {
        $this->_client->execute('authorize', [$email, $password]);
    }

    public function testQuickAuthorize()
    {
        $this->_client->execute('quickAuthorize', [$id, $clientSideToken]);
    }

    public function testChangePassword()
    {
        $this->_client->execute('changePassword', [$email, $password, $newPassword]);
    }

    public function testRequestResetPassword()
    {
        $this->_client->execute('requestResetPassword', [$email]);
    }

    public function testApproveResetPassword()
    {
        $this->_client->execute('approveResetPassword', [$email, $resetApprovalCode]);
    }

    public function testGetAccessRules()
    {
        $this->_client->execute('getAccessRules', [$personId, $eventId]);
    }

    public function testGetRuleValue()
    {
        $this->_client->execute('getRuleValue', [$personId, $eventId, $ruleName]);
    }

    public function testUpdatePersonalInfo()
    {
        $this->_client->execute('updatePersonalInfo', [
            $id, $title, $city, $email, $phone, $tenhouId
        ]);
    }

    public function testGetPersonalInfo()
    {
        $this->_client->execute('getPersonalInfo', [$idsArray]);
    }

    public function testFindByTitle()
    {
        $this->_client->execute('findByTitle', [$query]);
    }

    public function testGetGroups()
    {
        $this->_client->execute('getGroups', [$idsArray]);
    }

    // admin funcs

    public function testGetPersonAccess()
    {
        $this->_client->execute('getPersonAccess', [$personId, $eventId]);
    }

    public function testGetGroupAccess()
    {
        $this->_client->execute('getGroupAccess', [$groupId, $eventId]);
    }

    public function testAddRuleForPerson()
    {
        $this->_client->execute('addRuleForPerson', [
            $ruleName, $ruleValue, $ruleType,
            $personId, $eventId
        ]);
    }

    public function testAddRuleForGroup()
    {
        $this->_client->execute('addRuleForGroup', [
            $ruleName, $ruleValue, $ruleType,
            $groupId, $eventId
        ]);
    }

    public function testUpdateRuleForPerson()
    {
        $this->_client->execute('updateRuleForPerson', [
            $ruleId, $ruleValue, $ruleType
        ]);
    }

    public function testUpdateRuleForGroup()
    {
        $this->_client->execute('UpdateRuleForGroup', [
            $ruleId, $ruleValue, $ruleType
        ]);
    }

    public function testDeleteRuleForPerson()
    {
        $this->_client->execute('deleteRuleForPerson', [$ruleId]);
    }

    public function testDeleteRuleForGroup()
    {
        $this->_client->execute('deleteRuleForPerson', [$ruleId]);
    }

    public function testClearAccessCache()
    {
        $this->_client->execute('clearAccessCache', [$personId, $eventId]);
    }

    public function testCreateAccount()
    {
        $this->_client->execute('createAccount', [
            $email, $password, $title,
            $city, $phone, $tenhouId
        ]);
    }

    public function testCreateGroup()
    {
        $this->_client->execute('createGroup', [
            $title, $description, $color
        ]);
    }

    public function testUpdateGroup()
    {
        $this->_client->execute('updateGroup', [
            $id, $title, $description, $color
        ]);
    }

    public function testDeleteGroup()
    {
        $this->_client->execute('deleteGroup', [$groupId]);
    }

    public function testAddPersonToGroup()
    {
        $this->_client->execute('addPersonToGroup', [$personId, $groupId]);
    }

    public function testRemovePersonFromGroup()
    {
        $this->_client->execute('removePersonFromGroup', [$personId, $groupId]);
    }

    public function testGetPersonsOfGroup()
    {
        $this->_client->execute('getPersonsOfGroup', [$groupId]);
    }

    public function testGetGroupsOfPerson()
    {
        $this->_client->execute('getGroupsOfPerson', [$personId]);
    }
}
