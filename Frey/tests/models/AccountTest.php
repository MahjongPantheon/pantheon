<?php
/*  Frey: ACL & user data storage
 *  Copyright (C) 2018  o.klimenko aka ctizen
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

require_once __DIR__ . '/../../src/exceptions/InvalidParameters.php';
require_once __DIR__ . '/../../src/models/Account.php';
require_once __DIR__ . '/../../src/models/Auth.php';
require_once __DIR__ . '/../../src/primitives/Person.php';
require_once __DIR__ . '/../../src/primitives/Group.php';
require_once __DIR__ . '/../../src/helpers/Db.php';
require_once __DIR__ . '/../../src/helpers/Config.php';
require_once __DIR__ . '/../../src/helpers/Meta.php';

class AccountModelTest extends \PHPUnit\Framework\TestCase
{
    protected $_db;
    /**
     * @var Config
     */
    protected $_config;
    /**
     * @var Meta
     */
    protected $_meta;
    /**
     * @var PersonPrimitive
     */
    protected $_person;
    /**
     * @var GroupPrimitive
     */
    protected $_group;
    /**
     * @var int
     */
    protected $_eventId;
    /**
     * @var int|null
     */
    private ?int $_oldMetaEid;
    /**
     * @var string
     */
    private string $_oldToken;
    /**
     * @var int|null
     */
    private ?int $_oldPersonId;

    /**
     * @return void
     */
    protected function _loginMeta()
    {
        $this->_oldMetaEid = $this->_meta->getCurrentEventId();
        $this->_oldToken = $this->_meta->getAuthToken();
        $this->_oldPersonId = $this->_meta->getCurrentPersonId();
        $this->_meta->__setEventId($this->_eventId);
        $this->_meta->__setAuthToken($this->_authToken);
        $this->_meta->__setPersonId($this->_person->getId());
    }

    /**
     * @return void
     */
    protected function _resetMeta()
    {
        $this->_meta->__setEventId($this->_oldMetaEid);
        $this->_meta->__setAuthToken($this->_oldToken);
        $this->_meta->__setPersonId($this->_oldPersonId);
    }

    protected function setUp(): void
    {
        $this->_db = Db::__getCleanTestingInstance();
        $this->_config = new Config(getenv('OVERRIDE_CONFIG_PATH'));
        $this->_meta = new Meta(new \Common\Storage('localhost'), $_SERVER);

        $auth = new AuthModel($this->_db, $this->_config, $this->_meta);
        $tokens = $auth->makePasswordTokens('qwerasdfqwer');
        $this->_authToken = $tokens['client_hash'];
        $this->_person = (new PersonPrimitive($this->_db))
            ->setTitle('Test person')
            ->setEmail('test@test.com')
            ->setAuthHash($tokens['auth_hash'])
            ->setIsSuperadmin(true)
            ->setAuthSalt($tokens['salt']);
        $this->_person->save();

        $this->_group = (new GroupPrimitive($this->_db))
            ->setTitle('Test group')
            ->setDescription('Test description')
            ->setPersons([$this->_person])
            ->setLabelColor('#ffffff');
        $this->_group->save();

        $this->_loginMeta();
    }

    /**
     * @throws \Exception
     */
    public function testCreateAccount()
    {
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $personId = $model->createAccount(
            'test@email.com',
            'passwd',
            'test',
            'testcity',
            '111-111-111',
            'tid'
        );
        $this->assertNotEmpty($personId);
        $persons = PersonPrimitive::findById($this->_db, [$personId]);
        $this->assertNotEmpty($persons);
    }

    /**
     * @throws \Exception
     */
    public function testCreateAccountEmptyEmail()
    {
        $this->expectExceptionCode(401);
        $this->expectException(\Frey\InvalidParametersException::class);
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $model->createAccount(
            '',
            'passwd',
            'test',
            'testcity',
            '111-111-111',
            'tid'
        );
    }

    /**
     * @throws \Exception
     */
    public function testCreateAccountEmptyPassword()
    {
        $this->expectExceptionCode(401);
        $this->expectException(\Frey\InvalidParametersException::class);
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $model->createAccount(
            'test@email.com',
            '',
            'test',
            'testcity',
            '111-111-111',
            'tid'
        );
    }

    /**
     * @throws \Exception
     */
    public function testCreateAccountEmptyTitle()
    {
        $this->expectExceptionCode(401);
        $this->expectException(\Frey\InvalidParametersException::class);
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $model->createAccount(
            'test@email.com',
            'passwd',
            '',
            'testcity',
            '111-111-111',
            'tid'
        );
    }

    /**
     * @throws \Exception
     */
    public function testCreateAccountInvalidEmail()
    {
        $this->expectExceptionCode(402);
        $this->expectException(\Frey\InvalidParametersException::class);
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $model->createAccount(
            'testbademail.com',
            'passwd',
            'test',
            'testcity',
            '111-111-111',
            'tid'
        );
    }

    /**
     * @throws \Exception
     */
    public function testGetPersonalInfo()
    {
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $personId = $model->createAccount(
            'test@email.com',
            'passwd',
            'test',
            'testcity',
            '111-111-111',
            'tid'
        );
        $data = $model->getPersonalInfo([$personId]);
        // TODO uncomment for unfiltered data
//        $this->assertEquals('test@email.com', $data[0]['email']);
//        $this->assertEquals('111-111-111', $data[0]['phone']);
        $this->assertEquals('test', $data[0]['title']);
        $this->assertEquals('tid', $data[0]['tenhou_id']);
        $this->assertEquals($personId, $data[0]['id']);
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    // TODO: uncomment, remake using admin bootstrapping
    /*
    public function testGetPersonalInfoWithPrivateDataFilter()
    {
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $personId = $model->createAccount(
            'test@email.com',
            'passwd',
            'test',
            'testcity',
            '111-111-111',
            'tid'
        );
        $data = $model->getPersonalInfo([$personId], true);
        $this->assertEmpty($data[0]['email']);
        $this->assertEmpty($data[0]['phone']);
        $this->assertEquals('test', $data[0]['title']);
        $this->assertEquals('tid', $data[0]['tenhou_id']);
        $this->assertEquals($personId, $data[0]['id']);
    }
    */

    /**
     * @throws \Exception
     */
    public function testGetPersonalInfoEmptyList()
    {
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $persons = $model->getPersonalInfo([]);
        $this->assertEmpty($persons);
    }

    /**
     * @throws \Exception
     */
    public function testGetPersonalInfoNonexistingIds()
    {
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $persons = $model->getPersonalInfo([123]);
        $this->assertEmpty($persons);
    }

    /**
     * @throws \Exception
     */
    public function testFindByTenhouId()
    {
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $personId = $model->createAccount(
            'test@email.com',
            'passwd',
            'test',
            'testcity',
            '111-111-111',
            'tid'
        );
        $data = $model->findByTenhouId(['tid']);
        // TODO uncomment for unfiltered data
//        $this->assertEquals('test@email.com', $data[0]['email']);
//        $this->assertEquals('111-111-111', $data[0]['phone']);
        $this->assertEquals('test', $data[0]['title']);
        $this->assertEquals('tid', $data[0]['tenhou_id']);
        $this->assertEquals($personId, $data[0]['id']);
    }

    /**
     * @throws \Exception
     */
    public function testFindByTenhouIdEmptyList()
    {
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $persons = $model->findByTenhouId([]);
        $this->assertEmpty($persons);
    }

    /**
     * @throws \Exception
     */
    public function testFindByTenhouIdNonexistingIds()
    {
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $persons = $model->findByTenhouId([123]);
        $this->assertEmpty($persons);
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testUpdatePersonalInfo()
    {
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $personId = $model->createAccount(
            'test@email.com',
            'passwd',
            'test',
            'testcity',
            '111-111-111',
            'tid'
        );
        $success = $model->updatePersonalInfo(
            $personId,
            'test2',
            'testcountry2',
            'testcity2',
            'test2@email.com',
            '222-222-222',
            'tid2'
        );
        $this->assertTrue($success);
        $data = $model->getPersonalInfo([$personId]);
        // TODO uncomment for unfiltered data
//        $this->assertEquals('test2@email.com', $data[0]['email']);
//        $this->assertEquals('222-222-222', $data[0]['phone']);
        $this->assertEquals('test2', $data[0]['title']);
        $this->assertEquals('tid2', $data[0]['tenhou_id']);
        $this->assertEquals($personId, $data[0]['id']);
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testUpdatePersonalInfoIdNotFound()
    {
        $this->expectExceptionCode(406);
        $this->expectException(\Frey\InvalidParametersException::class);
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $model->updatePersonalInfo(
            123,
            'test2',
            'testcountry2',
            'testcity2',
            'test2@email.com',
            '222-222-222',
            'tid2'
        );
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testUpdatePersonalInfoEmptyTitle()
    {
        $this->expectException(\Frey\InvalidParametersException::class);
        $this->expectExceptionCode(407);
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $personId = $model->createAccount(
            'test@email.com',
            'passwd',
            'test',
            'testcity',
            '111-111-111',
            'tid'
        );
        $model->updatePersonalInfo(
            $personId,
            '',
            'testcountry2',
            'testcity2',
            'test2@email.com',
            '222-222-222',
            'tid2'
        );
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testUpdatePersonalInfoEmptyEmail()
    {
        $this->expectExceptionCode(408);
        $this->expectException(\Frey\InvalidParametersException::class);
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $personId = $model->createAccount(
            'test@email.com',
            'passwd',
            'test',
            'testcity',
            '111-111-111',
            'tid'
        );
        $model->updatePersonalInfo(
            $personId,
            'test2',
            'testcountry2',
            'testcity2',
            '',
            '222-222-222',
            'tid2'
        );
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testUpdatePersonalInfoInvalidEmail()
    {
        $this->expectExceptionCode(408);
        $this->expectException(\Frey\InvalidParametersException::class);
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $personId = $model->createAccount(
            'test@email.com',
            'passwd',
            'test',
            'testcity',
            '111-111-111',
            'tid'
        );
        $model->updatePersonalInfo(
            $personId,
            'test2',
            'testcountry2',
            'testcity2',
            'test2bademail.com',
            '222-222-222',
            'tid2'
        );
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testFindByTitleFuzzy()
    {
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $personId = $model->createAccount(
            'test@email.com',
            'passwd',
            'easyfindableperson',
            'testcity',
            '111-111-111',
            'tid'
        );

        $emptyresults = $model->findByTitleFuzzy('watisthis');
        $this->assertEmpty($emptyresults);

        $results = $model->findByTitleFuzzy('easyfind');
        $this->assertNotEmpty($results);
        $this->assertEquals('testcity', $results[0]['city']);
        $this->assertEquals('easyfindableperson', $results[0]['title']);
        $this->assertEquals('tid', $results[0]['tenhou_id']);
        $this->assertEquals($personId, $results[0]['id']);
    }

    /**
     * @throws InvalidParametersException
     */
    public function testFindByTitleFuzzyTooShortQuery()
    {
        $this->expectExceptionCode(409);
        $this->expectException(\Frey\InvalidParametersException::class);
        $model = new AccountModel($this->_db, $this->_config, $this->_meta);
        $model->findByTitleFuzzy('w');
    }
}
