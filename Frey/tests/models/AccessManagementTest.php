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

require_once __DIR__ . '/../../src/exceptions/DuplicateEntity.php';
require_once __DIR__ . '/../../src/models/AccessManagement.php';
require_once __DIR__ . '/../../src/primitives/Person.php';
require_once __DIR__ . '/../../src/primitives/Group.php';
require_once __DIR__ . '/../../src/primitives/Access.php';
require_once __DIR__ . '/../../src/Db.php';
require_once __DIR__ . '/../../src/Config.php';
require_once __DIR__ . '/../../src/Meta.php';

class AccessManagementModelTest extends \PHPUnit_Framework_TestCase
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

        $this->_eventId = mt_rand(1, 500);
        AccessManagementModel::clearAccessCache($this->_person->getId(), $this->_eventId);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testAddRuleForPerson()
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $ruleId = $model->addRuleForPerson(
            'test_rule', 'ololo',
            AccessPrimitive::TYPE_ENUM, $this->_person->getId(),
            $this->_eventId
        );
        $this->assertNotNull($ruleId);
        $this->assertEquals('ololo', $model->getPersonAccess(
            $this->_person->getId(), $this->_eventId
        )['test_rule']);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     * @expectedException \Frey\DuplicateEntityException
     */
    public function testAddDuplicateRuleForPerson()
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $model->addRuleForPerson(
            'test_rule', 'ololo',
            AccessPrimitive::TYPE_ENUM, $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForPerson(
            'test_rule', 'ololo',
            AccessPrimitive::TYPE_ENUM, $this->_person->getId(),
            $this->_eventId
        );
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testUpdateRuleForPerson()
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $ruleId = $model->addRuleForPerson(
            'test_rule', 'ololo',
            AccessPrimitive::TYPE_ENUM, $this->_person->getId(),
            $this->_eventId
        );

        $success = $model->updateRuleForPerson(
            $ruleId, 'trololo', AccessPrimitive::TYPE_ENUM
        );
        $this->assertTrue($success);

        $this->assertEquals('trololo', $model->getPersonAccess(
            $this->_person->getId(), $this->_eventId
        )['test_rule']);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testAddRuleForGroup()
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $ruleId = $model->addRuleForGroup(
            'test_rule', 'ololo',
            AccessPrimitive::TYPE_ENUM, $this->_group->getId(),
            $this->_eventId
        );
        $this->assertNotNull($ruleId);
        $this->assertEquals('ololo', $model->getGroupAccess(
            $this->_group->getId(), $this->_eventId
        )['test_rule']);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     * @expectedException \Frey\DuplicateEntityException
     */
    public function testAddDuplicateRuleForGroup()
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $model->addRuleForGroup(
            'test_rule', 'ololo',
            AccessPrimitive::TYPE_ENUM, $this->_group->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule', 'ololo',
            AccessPrimitive::TYPE_ENUM, $this->_group->getId(),
            $this->_eventId
        );
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testUpdateRuleForGroup()
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $ruleId = $model->addRuleForGroup(
            'test_rule', 'ololo',
            AccessPrimitive::TYPE_ENUM, $this->_group->getId(),
            $this->_eventId
        );

        $success = $model->updateRuleForGroup(
            $ruleId, 'trololo', AccessPrimitive::TYPE_ENUM
        );
        $this->assertTrue($success);

        $this->assertEquals('trololo', $model->getGroupAccess(
            $this->_group->getId(), $this->_eventId
        )['test_rule']);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testDeleteRuleForPerson()
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $ruleId = $model->addRuleForPerson(
            'test_rule', 'ololo',
            AccessPrimitive::TYPE_ENUM, $this->_person->getId(),
            $this->_eventId
        );

        $model->deleteRuleForPerson($ruleId);

        $this->assertEmpty($model->getPersonAccess(
            $this->_person->getId(), $this->_eventId
        ));
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testDeleteRuleForGroup()
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $ruleId = $model->addRuleForGroup(
            'test_rule', 'ololo',
            AccessPrimitive::TYPE_ENUM, $this->_group->getId(),
            $this->_eventId
        );

        $model->deleteRuleForGroup($ruleId);

        $this->assertEmpty($model->getGroupAccess(
            $this->_group->getId(), $this->_eventId
        ));
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testGetAccessRulesUnion()
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $model->addRuleForPerson(
            'test_rule1', 'ololo1',
            AccessPrimitive::TYPE_ENUM, $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForPerson(
            'test_rule3', 'ololo3',
            AccessPrimitive::TYPE_ENUM, $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule2', 'ololo2',
            AccessPrimitive::TYPE_ENUM, $this->_group->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule4', 'ololo4',
            AccessPrimitive::TYPE_ENUM, $this->_group->getId(),
            $this->_eventId
        );
        $rules = $model->getAccessRules(
            $this->_person->getId(), $this->_eventId
        );
        $this->assertEquals('ololo1', $rules['test_rule1']);
        $this->assertEquals('ololo2', $rules['test_rule2']);
        $this->assertEquals('ololo3', $rules['test_rule3']);
        $this->assertEquals('ololo4', $rules['test_rule4']);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testGetAccessRulesCollide()
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $model->addRuleForPerson(
            'test_rule_collide', 'ololo_person',
            AccessPrimitive::TYPE_ENUM, $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForPerson(
            'test_rule1', 'ololo1',
            AccessPrimitive::TYPE_ENUM, $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule2', 'ololo2',
            AccessPrimitive::TYPE_ENUM, $this->_group->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule_collide', 'ololo_group',
            AccessPrimitive::TYPE_ENUM, $this->_group->getId(),
            $this->_eventId
        );
        $rules = $model->getAccessRules(
            $this->_person->getId(), $this->_eventId
        );
        $this->assertEquals('ololo1', $rules['test_rule1']);
        $this->assertEquals('ololo2', $rules['test_rule2']);
        $this->assertEquals('ololo_person', $rules['test_rule_collide']); // person overrides group
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testGetAccessValue()
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $model->addRuleForPerson(
            'test_rule_collide', 'ololo_person',
            AccessPrimitive::TYPE_ENUM, $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForPerson(
            'test_rule1', 'ololo1',
            AccessPrimitive::TYPE_ENUM, $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule2', 'ololo2',
            AccessPrimitive::TYPE_ENUM, $this->_group->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule_collide', 'ololo_group',
            AccessPrimitive::TYPE_ENUM, $this->_group->getId(),
            $this->_eventId
        );
        $this->assertEquals('ololo1', $model->getRuleValue(
            $this->_person->getId(), $this->_eventId, 'test_rule1'));
        $this->assertEquals('ololo2', $model->getRuleValue(
            $this->_person->getId(), $this->_eventId, 'test_rule2'));
        $this->assertEquals('ololo_person', $model->getRuleValue(
            $this->_person->getId(), $this->_eventId, 'test_rule_collide')); // person overrides group
    }
}
