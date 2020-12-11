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

require_once __DIR__ . '/../../src/primitives/PersonAccess.php';
require_once __DIR__ . '/../../src/primitives/Person.php';
require_once __DIR__ . '/../../src/helpers/Db.php';

class PersonAccessPrimitiveTest extends \PHPUnit\Framework\TestCase
{
    protected $_db;
    /** @var PersonPrimitive */
    protected $_person;

    public function setUp()
    {
        $this->_db = Db::__getCleanTestingInstance();
        $this->_person = new PersonPrimitive($this->_db);
        $this->_person->setTitle('test')->setEmail('test@test.com')->save();
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testNewPersonAccess()
    {
        $newPersonAccess = new PersonAccessPrimitive($this->_db);
        $newPersonAccess
            ->setPerson($this->_person)
            ->setEventId(7)
            ->setAclName('testacl')
            ->setAclType(PersonAccessPrimitive::TYPE_INT)
            ->setAclValue(120);

        $this->assertEquals($this->_person->getId(), $newPersonAccess->getPersonId());
        $this->assertEquals($this->_person->getId(), $newPersonAccess->getPerson()->getId());
        $this->assertEquals(7, $newPersonAccess->getEventId());
        $this->assertEquals('testacl', $newPersonAccess->getAclName());
        $this->assertEquals(PersonAccessPrimitive::TYPE_INT, $newPersonAccess->getAclType());
        $this->assertEquals(120, $newPersonAccess->getAclValue());

        $success = $newPersonAccess->save();
        $this->assertTrue($success, "Saved person access");
        $this->assertGreaterThan(0, $newPersonAccess->getId());
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testFindPersonAccessById()
    {
        $newPersonAccess = new PersonAccessPrimitive($this->_db);
        $newPersonAccess
            ->setPerson($this->_person)
            ->setEventId(7)
            ->setAclName('test')
            ->setAclType(PersonAccessPrimitive::TYPE_INT)
            ->setAclValue(23)
            ->save();

        $personAccessCopy = PersonAccessPrimitive::findById($this->_db, [$newPersonAccess->getId()]);
        $this->assertEquals(1, count($personAccessCopy));
        $this->assertEquals('test', $personAccessCopy[0]->getAclName());
        $this->assertTrue($newPersonAccess !== $personAccessCopy[0]); // different objects!
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testFindPersonAccessByPerson()
    {
        $newGroupAccess = new PersonAccessPrimitive($this->_db);
        $newGroupAccess
            ->setPerson($this->_person)
            ->setEventId(7)
            ->setAclName('test')
            ->setAclType(PersonAccessPrimitive::TYPE_INT)
            ->setAclValue(23)
            ->save();

        $personAccessCopy = PersonAccessPrimitive::findByPerson($this->_db, [$this->_person->getId()]);
        $this->assertEquals(1, count($personAccessCopy));
        $this->assertEquals('test', $personAccessCopy[0]->getAclName());
        $this->assertTrue($newGroupAccess !== $personAccessCopy[0]); // different objects!
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testUpdatePersonAccess()
    {
        $newPersonAccess = new PersonAccessPrimitive($this->_db);
        $newPersonAccess
            ->setPerson($this->_person)
            ->setEventId(7)
            ->setAclName('test')
            ->setAclType(GroupAccessPrimitive::TYPE_INT)
            ->setAclValue(23)
            ->save();

        $personAccessCopy = PersonAccessPrimitive::findById($this->_db, [$newPersonAccess->getId()]);
        $personAccessCopy[0]->setEventId(8)->save();

        $anotherPersonAccessCopy = PersonAccessPrimitive::findById($this->_db, [$newPersonAccess->getId()]);
        $this->assertEquals(8, $anotherPersonAccessCopy[0]->getEventId());
    }
}
