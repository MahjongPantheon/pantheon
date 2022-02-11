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

require_once __DIR__ . '/../../src/primitives/Person.php';
require_once __DIR__ . '/../../src/primitives/Group.php';
require_once __DIR__ . '/../../src/helpers/Db.php';

class PersonPrimitiveTest extends \PHPUnit\Framework\TestCase
{
    protected $_db;
    public function setUp()
    {
        $this->_db = Db::__getCleanTestingInstance();
    }

    public function testNewPerson()
    {
        $newPerson = new PersonPrimitive($this->_db);
        $newPerson
            ->setTitle('person1')
            ->setTitleEn('person1_en')
            ->setEmail('test@mail.com')
            ->setAuthSalt('testsalt')
            ->setAuthHash('testhash')
            ->setAuthResetToken('testresettoken')
            ->setCity('testcity')
            ->setPhone('testphone')
            ->setTenhouId('testtenhou');

        $this->assertEquals('person1', $newPerson->getTitle());
        $this->assertEquals('person1_en', $newPerson->getTitleEn());
        $this->assertEquals('test@mail.com', $newPerson->getEmail());
        $this->assertEquals('testsalt', $newPerson->getAuthSalt());
        $this->assertEquals('testhash', $newPerson->getAuthHash());
        $this->assertEquals('testresettoken', $newPerson->getAuthResetToken());
        $this->assertEquals('testcity', $newPerson->getCity());
        $this->assertEquals('testphone', $newPerson->getPhone());
        $this->assertEquals('testtenhou', $newPerson->getTenhouId());

        $success = $newPerson->save();
        $this->assertTrue($success, "Saved person");
        $this->assertGreaterThan(0, $newPerson->getId());
    }

    /**
     * @throws \Exception
     */
    public function testFindPersonById()
    {
        $newPerson = new PersonPrimitive($this->_db);
        $newPerson
            ->setTitle('person1')
            ->setTitleEn('person1_en')
            ->setEmail('test@mail.com')
            ->setCity('testcity')
            ->setPhone('testphone')
            ->setTenhouId('testtenhou')
            ->save();

        $personCopy = PersonPrimitive::findById($this->_db, [$newPerson->getId()]);
        $this->assertEquals(1, count($personCopy));
        $this->assertEquals('person1', $personCopy[0]->getTitle());
        $this->assertEquals('person1_en', $personCopy[0]->getTitleEn());
        $this->assertTrue($newPerson !== $personCopy[0]); // different objects!
    }

    /**
     * @throws \Exception
     */
    public function testFindPersonByTenhouId()
    {
        $newPerson = new PersonPrimitive($this->_db);
        $newPerson
            ->setTitle('person1')
            ->setTitleEn('person1_en')
            ->setEmail('test@mail.com')
            ->setCity('testcity')
            ->setPhone('testphone')
            ->setTenhouId('testtenhou')
            ->save();

        $personCopy = PersonPrimitive::findByTenhouId($this->_db, [$newPerson->getTenhouId()]);
        $this->assertEquals(1, count($personCopy));
        $this->assertEquals('person1', $personCopy[0]->getTitle());
        $this->assertEquals('person1_en', $personCopy[0]->getTitleEn());
        $this->assertTrue($newPerson !== $personCopy[0]); // different objects!
    }

    /**
     * @throws \Exception
     */
    public function testFindPersonByEmail()
    {
        $newPerson = new PersonPrimitive($this->_db);
        $newPerson
            ->setTitle('person1')
            ->setTitleEn('person1_en')
            ->setEmail('test@mail.com')
            ->setCity('testcity')
            ->setPhone('testphone')
            ->setTenhouId('testtenhou')
            ->save();

        $personCopy = PersonPrimitive::findByEmail($this->_db, [$newPerson->getEmail()]);
        $this->assertEquals(1, count($personCopy));
        $this->assertEquals('person1', $personCopy[0]->getTitle());
        $this->assertEquals('person1_en', $personCopy[0]->getTitleEn());
        $this->assertTrue($newPerson !== $personCopy[0]); // different objects!
    }

    public function testFindPersonByTitleFuzzyTooShortQuery()
    {
        $newPerson = new PersonPrimitive($this->_db);
        $newPerson
            ->setTitle('person1')
            ->setTitleEn('person1_en')
            ->setEmail('test@mail.com')
            ->setCity('testcity')
            ->setPhone('testphone')
            ->setTenhouId('testtenhou')
            ->save();

        $personCopy = PersonPrimitive::findByTitleFuzzy($this->_db, 'p');
        $this->assertEquals(null, $personCopy);
    }

    public function testFindPersonByTitleFuzzyNotFound()
    {
        $newPerson = new PersonPrimitive($this->_db);
        $newPerson
            ->setTitle('person1')
            ->setTitleEn('person1')
            ->setEmail('test@mail.com')
            ->setCity('testcity')
            ->setPhone('testphone')
            ->setTenhouId('testtenhou')
            ->save();

        $personCopy = PersonPrimitive::findByTitleFuzzy($this->_db, 'nosuchtitle');
        $this->assertEquals(0, count($personCopy));
    }

    public function testFindPersonByTitleFuzzySuccessFromStart()
    {
        $newPerson = new PersonPrimitive($this->_db);
        $newPerson
            ->setTitle('person1')
            ->setTitleEn('english1')
            ->setEmail('test@mail.com')
            ->setCity('testcity')
            ->setPhone('testphone')
            ->setTenhouId('testtenhou')
            ->save();

        $personCopy = PersonPrimitive::findByTitleFuzzy($this->_db, 'pers');
        $this->assertEquals(1, count($personCopy));
        $this->assertEquals('person1', $personCopy[0]->getTitle());
        $this->assertEquals('english1', $personCopy[0]->getTitleEn());
        $this->assertTrue($newPerson !== $personCopy[0]); // different objects!

        $personCopy2 = PersonPrimitive::findByTitleFuzzy($this->_db, 'engl');
        $this->assertEquals(1, count($personCopy2));
        $this->assertEquals('person1', $personCopy2[0]->getTitle());
        $this->assertEquals('english1', $personCopy2[0]->getTitleEn());
        $this->assertTrue($newPerson !== $personCopy2[0]); // different objects!
    }

    /**
     * @throws \Exception
     */
    public function testUpdatePerson()
    {
        $newPerson = new PersonPrimitive($this->_db);
        $newPerson
            ->setTitle('person1')
            ->setTitleEn('person1_en')
            ->setEmail('test@mail.com')
            ->setCity('testcity')
            ->setPhone('testphone')
            ->setTenhouId('testtenhou')
            ->save();

        $personCopy = PersonPrimitive::findById($this->_db, [$newPerson->getId()]);
        $personCopy[0]
            ->setTitle('anotherperson')
            ->setTitleEn('anotherperson_en')
            ->save();

        $anotherPersonCopy = PersonPrimitive::findById($this->_db, [$newPerson->getId()]);
        $this->assertEquals('anotherperson', $anotherPersonCopy[0]->getTitle());
        $this->assertEquals('anotherperson_en', $anotherPersonCopy[0]->getTitleEn());
    }

    /**
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testRelationGroup()
    {
        $newGroup = new GroupPrimitive($this->_db);
        $newGroup
            ->setTitle('newgroup')
            ->setDescription('test description')
            ->setLabelColor('#123123')
            ->save();

        $newPerson = new PersonPrimitive($this->_db);
        $newPerson
            ->setTitle('person1')
            ->setTitleEn('person1')
            ->setEmail('test@mail.com')
            ->setCity('testcity')
            ->setPhone('testphone')
            ->setTenhouId('testtenhou')
            ->setGroups([$newGroup])
            ->save();

        $personCopy = PersonPrimitive::findById($this->_db, [$newPerson->getId()])[0];
        $this->assertEquals(1, count($personCopy->getGroupIds()));
        $this->assertEquals($newGroup->getId(), $personCopy->getGroupIds()[0]); // before fetch
        $this->assertNotEmpty($personCopy->getGroups());
        $this->assertEquals($newGroup->getId(), $personCopy->getGroups()[0]->getId());
        $this->assertTrue($newGroup !== $personCopy->getGroups()[0]); // different objects!
    }
}
