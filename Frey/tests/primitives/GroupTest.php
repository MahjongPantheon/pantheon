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

require_once __DIR__ . '/../../src/primitives/Group.php';
require_once __DIR__ . '/../../src/primitives/Person.php';
require_once __DIR__ . '/../../src/helpers/Db.php';

class GroupPrimitiveTest extends \PHPUnit\Framework\TestCase
{
    protected $_db;
    public function setUp()
    {
        $this->_db = Db::__getCleanTestingInstance();
    }

    public function testNewGroup()
    {
        $newGroup = new GroupPrimitive($this->_db);
        $newGroup
            ->setTitle('group1')
            ->setLabelColor('#012345')
            ->setDescription('group desc');

        $this->assertEquals('group1', $newGroup->getTitle());
        $this->assertEquals('#012345', $newGroup->getLabelColor());
        $this->assertEquals('group desc', $newGroup->getDescription());

        $success = $newGroup->save();
        $this->assertTrue($success, "Saved group");
        $this->assertGreaterThan(0, $newGroup->getId());
    }

    /**
     * @throws \Exception
     */
    public function testFindGroupById()
    {
        $newGroup = new GroupPrimitive($this->_db);
        $newGroup
            ->setTitle('group1')
            ->setLabelColor('#012345')
            ->setDescription('group desc')
            ->save();

        $groupCopy = GroupPrimitive::findById($this->_db, [$newGroup->getId()]);
        $this->assertEquals(1, count($groupCopy));
        $this->assertEquals('group1', $groupCopy[0]->getTitle());
        $this->assertTrue($newGroup !== $groupCopy[0]); // different objects!
    }

    /**
     * @throws \Exception
     */
    public function testUpdateGroup()
    {
        $newGroup = new GroupPrimitive($this->_db);
        $newGroup
            ->setTitle('group1')
            ->setLabelColor('#012345')
            ->setDescription('group desc')
            ->save();

        $groupCopy = GroupPrimitive::findById($this->_db, [$newGroup->getId()]);
        $groupCopy[0]->setTitle('anothergroup')->save();

        $anotherGroupCopy = GroupPrimitive::findById($this->_db, [$newGroup->getId()]);
        $this->assertEquals('anothergroup', $anotherGroupCopy[0]->getTitle());
    }

    /**
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testRelationPerson()
    {
        $newPerson = new PersonPrimitive($this->_db);
        $newPerson
            ->setTitle('person1')
            ->setEmail('test@mail.com')
            ->setCity('testcity')
            ->setPhone('testphone')
            ->setTenhouId('testtenhou')
            ->save();

        $newGroup = new GroupPrimitive($this->_db);
        $newGroup
            ->setTitle('newgroup')
            ->setDescription('test description')
            ->setLabelColor('#123123')
            ->setPersons([$newPerson])
            ->save();

        $groupCopy = GroupPrimitive::findById($this->_db, [$newGroup->getId()])[0];
        $this->assertEquals(1, count($groupCopy->getPersonIds()));
        $this->assertEquals($newGroup->getId(), $groupCopy->getPersonIds()[0]); // before fetch
        $this->assertNotEmpty($groupCopy->getPersons());
        $this->assertEquals($newGroup->getId(), $groupCopy->getPersons()[0]->getId());
        $this->assertTrue($newGroup !== $groupCopy->getPersons()[0]); // different objects!
    }
}
