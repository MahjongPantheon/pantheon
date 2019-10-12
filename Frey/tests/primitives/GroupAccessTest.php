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

require_once __DIR__ . '/../../src/primitives/GroupAccess.php';
require_once __DIR__ . '/../../src/primitives/Group.php';
require_once __DIR__ . '/../../src/helpers/Db.php';

class GroupAccessPrimitiveTest extends \PHPUnit\Framework\TestCase
{
    protected $_db;
    /** @var GroupPrimitive */
    protected $_group;

    public function setUp()
    {
        $this->_db = Db::__getCleanTestingInstance();
        $this->_group = new GroupPrimitive($this->_db);
        $this->_group->setTitle('test')->setDescription('test')->save();
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testNewGroupAccess()
    {
        $newGroupAccess = new GroupAccessPrimitive($this->_db);
        $newGroupAccess
            ->setGroup($this->_group)
            ->setEventIds([1, 2, 3])
            ->setAclName('testacl')
            ->setAclType(GroupAccessPrimitive::TYPE_INT)
            ->setAclValue(120);

        $this->assertEquals($this->_group->getId(), $newGroupAccess->getGroupId());
        $this->assertEquals($this->_group->getId(), $newGroupAccess->getGroup()->getId());
        $this->assertEquals(1, $newGroupAccess->getEventsId()[0]);
        $this->assertEquals(2, $newGroupAccess->getEventsId()[1]);
        $this->assertEquals(3, $newGroupAccess->getEventsId()[2]);
        $this->assertEquals('testacl', $newGroupAccess->getAclName());
        $this->assertEquals(GroupAccessPrimitive::TYPE_INT, $newGroupAccess->getAclType());
        $this->assertEquals(120, $newGroupAccess->getAclValue());

        $success = $newGroupAccess->save();
        $this->assertTrue($success, "Saved group access");
        $this->assertGreaterThan(0, $newGroupAccess->getId());
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testFindGroupAccessById()
    {
        $newGroupAccess = new GroupAccessPrimitive($this->_db);
        $newGroupAccess
            ->setGroup($this->_group)
            ->setEventIds([1,2,3])
            ->setAclName('test')
            ->setAclType(GroupAccessPrimitive::TYPE_INT)
            ->setAclValue(23)
            ->save();

        $groupAccessCopy = GroupAccessPrimitive::findById($this->_db, [$newGroupAccess->getId()]);
        $this->assertEquals(1, count($groupAccessCopy));
        $this->assertEquals('test', $groupAccessCopy[0]->getAclName());
        $this->assertTrue($newGroupAccess !== $groupAccessCopy[0]); // different objects!
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testFindGroupAccessByGroup()
    {
        $newGroupAccess = new GroupAccessPrimitive($this->_db);
        $newGroupAccess
            ->setGroup($this->_group)
            ->setEventIds([1,2,3])
            ->setAclName('test')
            ->setAclType(GroupAccessPrimitive::TYPE_INT)
            ->setAclValue(23)
            ->save();

        $groupAccessCopy = GroupAccessPrimitive::findByGroup($this->_db, [$this->_group->getId()]);
        $this->assertEquals(1, count($groupAccessCopy));
        $this->assertEquals('test', $groupAccessCopy[0]->getAclName());
        $this->assertTrue($newGroupAccess !== $groupAccessCopy[0]); // different objects!
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testUpdateGroupAccess()
    {
        $newGroupAccess = new GroupAccessPrimitive($this->_db);
        $newGroupAccess
            ->setGroup($this->_group)
            ->setEventIds([1,2,3])
            ->setAclName('test')
            ->setAclType(GroupAccessPrimitive::TYPE_INT)
            ->setAclValue(23)
            ->save();

        $groupAccessCopy = GroupAccessPrimitive::findById($this->_db, [$newGroupAccess->getId()]);
        $groupAccessCopy[0]->setEventIds([4])->save();

        $anotherGroupAccessCopy = GroupAccessPrimitive::findById($this->_db, [$newGroupAccess->getId()]);
        $this->assertEquals(1, count($anotherGroupAccessCopy[0]->getEventsId()));
        $this->assertEquals(4, $anotherGroupAccessCopy[0]->getEventsId()[0]);
    }
}
