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
require_once __DIR__ . '/../../src/models/Groups.php';
require_once __DIR__ . '/../../src/primitives/Person.php';
require_once __DIR__ . '/../../src/primitives/Group.php';
require_once __DIR__ . '/../../src/Db.php';
require_once __DIR__ . '/../../src/Config.php';
require_once __DIR__ . '/../../src/Meta.php';

class GroupsModelTest extends \PHPUnit_Framework_TestCase
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
     * @var int
     */
    protected $_eventId;

    public function setUp()
    {
        $this->_db = Db::__getCleanTestingInstance();
        $this->_config = new Config(getenv('OVERRIDE_CONFIG_PATH'));
        $this->_meta = new Meta($_SERVER);
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testCreateGroup()
    {
        $model = new GroupsModel($this->_db, $this->_config, $this->_meta);
        $groupId = $model->createGroup('Test group', 'Test group description', '123456');
        $this->assertNotEmpty($groupId);

        $group = GroupPrimitive::findById($this->_db, [$groupId]);
        $this->assertNotEmpty($group);

        $this->assertEquals('Test group', $group[0]->getTitle());
        $this->assertEquals('Test group description', $group[0]->getDescription());
        $this->assertEquals('123456', $group[0]->getLabelColor());
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     * @expectedException \Frey\InvalidParametersException
     * @expectedExceptionCode 401
     */
    public function testCreateGroupEmptyTitle()
    {
        $model = new GroupsModel($this->_db, $this->_config, $this->_meta);
        $model->createGroup('', '', '');
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testGetGroups()
    {
        $model = new GroupsModel($this->_db, $this->_config, $this->_meta);
        $group1Id = $model->createGroup('Test group 1', 'Test group 1 description', '123456');
        $group2Id = $model->createGroup('Test group 2', 'Test group 2 description', '654321');

        $groups = $model->getGroups([$group1Id, $group2Id]);
        $this->assertNotEmpty($groups);

        $this->assertEquals($group1Id, $groups[0]['id']);
        $this->assertEquals($group2Id, $groups[1]['id']);
        $this->assertEquals('Test group 1', $groups[0]['title']);
        $this->assertEquals('Test group 2', $groups[1]['title']);
        $this->assertEquals('Test group 1 description', $groups[0]['description']);
        $this->assertEquals('Test group 2 description', $groups[1]['description']);
        $this->assertEquals('123456', $groups[0]['label_color']);
        $this->assertEquals('654321', $groups[1]['label_color']);
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     * @expectedException \Frey\InvalidParametersException
     * @expectedExceptionCode 403
     */
    public function testGetGroupsEmptyList()
    {
        $model = new GroupsModel($this->_db, $this->_config, $this->_meta);
        $model->getGroups([]);
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testGetGroupsNonexistingIds()
    {
        $model = new GroupsModel($this->_db, $this->_config, $this->_meta);
        $groups = $model->getGroups([100, 200]);
        $this->assertEmpty($groups);
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testUpdateGroup()
    {
        $model = new GroupsModel($this->_db, $this->_config, $this->_meta);
        $groupId = $model->createGroup('Test group', 'Test group description', '123456');
        $success = $model->updateGroup($groupId, 'Updated group', 'Updated description', '654321');
        $this->assertTrue($success);

        $group = GroupPrimitive::findById($this->_db, [$groupId]);
        $this->assertNotEmpty($group);

        $this->assertEquals('Updated group', $group[0]->getTitle());
        $this->assertEquals('Updated description', $group[0]->getDescription());
        $this->assertEquals('654321', $group[0]->getLabelColor());
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     * @expectedException \Frey\InvalidParametersException
     * @expectedExceptionCode 404
     */
    public function testUpdateGroupBadId()
    {
        $model = new GroupsModel($this->_db, $this->_config, $this->_meta);
        $model->updateGroup('lol', 'Updated group', 'Updated description', '654321');
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     * @expectedException \Frey\InvalidParametersException
     * @expectedExceptionCode 405
     */
    public function testUpdateGroupIdNotFound()
    {
        $model = new GroupsModel($this->_db, $this->_config, $this->_meta);
        $model->updateGroup(1234, 'Updated group', 'Updated description', '654321');
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     * @expectedException \Frey\InvalidParametersException
     * @expectedExceptionCode 406
     */
    public function testUpdateGroupBadTitle()
    {
        $model = new GroupsModel($this->_db, $this->_config, $this->_meta);
        $groupId = $model->createGroup('Test group', 'Test group description', '123456');
        $model->updateGroup($groupId, '', '', '');
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testDeleteGroup()
    {
        $model = new GroupsModel($this->_db, $this->_config, $this->_meta);
        $groupId = $model->createGroup('Test group', 'Test group description', '123456');
        $model->deleteGroup($groupId);

        $group = GroupPrimitive::findById($this->_db, [$groupId]);
        $this->assertEmpty($group);
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     * @expectedException \Frey\InvalidParametersException
     * @expectedExceptionCode 407
     */
    public function testDeleteGroupBadId()
    {
        $model = new GroupsModel($this->_db, $this->_config, $this->_meta);
        $model->deleteGroup('lol');
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     * @expectedException \Frey\InvalidParametersException
     * @expectedExceptionCode 408
     */
    public function testDeleteGroupIdNotFound()
    {
        $model = new GroupsModel($this->_db, $this->_config, $this->_meta);
        $model->deleteGroup(123);
    }

    public function testAddPersonToGroup()
    {

    }

    public function testAddPersonToGroupBadGroupId()
    {

    }

    public function testAddPersonToGroupBadPersonId()
    {

    }

    public function testAddPersonToGroupGroupIdNotFound()
    {

    }

    public function testAddPersonToGroupPersonIdNotFound()
    {

    }

    public function testRemovePersonFromGroup()
    {

    }

    public function testRemovePersonToGroupBadGroupId()
    {

    }

    public function testRemovePersonToGroupBadPersonId()
    {

    }

    public function testRemovePersonToGroupGroupIdNotFound()
    {

    }

    public function testRemovePersonToGroupPersonIdNotFound()
    {

    }

    public function testGetGroupsOfPerson()
    {

    }

    public function testGetGroupsOfPersonBadId()
    {

    }

    public function testGetGroupsOfPersonNotFound()
    {

    }

    public function testGetPersonsOfGroup()
    {

    }

    public function testGetPersonsOfGroupBadId()
    {

    }

    public function testGetPersonsOfGroupGroupNotFound()
    {

    }
}
