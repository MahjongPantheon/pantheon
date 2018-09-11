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
require_once __DIR__ . '/../../src/primitives/Person.php';
require_once __DIR__ . '/../../src/primitives/Group.php';
require_once __DIR__ . '/../../src/Db.php';
require_once __DIR__ . '/../../src/Config.php';
require_once __DIR__ . '/../../src/Meta.php';

class AccountModelTest extends \PHPUnit_Framework_TestCase
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

    public function setUp()
    {
        $this->_db = Db::__getCleanTestingInstance();
        $this->_config = new Config(getenv('OVERRIDE_CONFIG_PATH'));
        $this->_meta = new Meta($_SERVER);

        $this->_person = (new PersonPrimitive($this->_db))
            ->setTitle('Test person')
            ->setEmail('test@test.com');
        $this->_person->save();

        $this->_group = (new GroupPrimitive($this->_db))
            ->setTitle('Test group')
            ->setDescription('Test description')
            ->setPersons([$this->_person])
            ->setLabelColor('#ffffff');
        $this->_group->save();
    }

    public function testCreateAccount()
    {
    }

    public function testCreateAccountEmptyEmail()
    {
    }

    public function testCreateAccountEmptyPassword()
    {
    }

    public function testCreateAccountEmptyTitle()
    {
    }

    public function testCreateAccountInvalidEmail()
    {
    }

    public function testGetPersonalInfo()
    {
    }

    public function testGetPersonalInfoEmptyList()
    {
    }

    public function testGetPersonalInfoNonexistingIds()
    {
    }

    public function testUpdatePersonalInfo()
    {
    }

    public function testUpdatePersonalInfoBadId()
    {
    }

    public function testUpdatePersonalInfoIdNotFound()
    {
    }

    public function testUpdatePersonalInfoEmptyTitle()
    {
    }

    public function testUpdatePersonalInfoEmptyEmail()
    {
    }

    public function testUpdatePersonalInfoInvalidEmail()
    {
    }

    public function testFindByTitleFuzzy()
    {
    }

    public function testFindByTitleFuzzyTooShortQuery()
    {
    }
}
