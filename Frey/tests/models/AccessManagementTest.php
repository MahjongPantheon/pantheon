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
        $this->_testAddRuleForPerson($this->_eventId);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testAddRuleForPersonSystemwide()
    {
        $this->_testAddRuleForPerson(null);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     * @expectedException \Frey\DuplicateEntityException
     */
    public function testAddDuplicateRuleForPerson()
    {
        $this->_testAddDuplicateRuleForPerson($this->_eventId);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     * @expectedException \Frey\DuplicateEntityException
     */
    public function testAddDuplicateRuleForPersonSystemwide()
    {
        $this->_testAddDuplicateRuleForPerson(null);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testUpdateRuleForPerson()
    {
        $this->_testUpdateRuleForPerson($this->_eventId);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testUpdateRuleForPersonSystemwide()
    {
        $this->_testUpdateRuleForPerson(null);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testAddRuleForGroup()
    {
        $this->_testAddRuleForGroup($this->_eventId);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testAddRuleForGroupSystemwide()
    {
        $this->_testAddRuleForGroup(null);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     * @expectedException \Frey\DuplicateEntityException
     */
    public function testAddDuplicateRuleForGroup()
    {
        $this->_testAddDuplicateRuleForGroup($this->_eventId);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     * @expectedException \Frey\DuplicateEntityException
     */
    public function testAddDuplicateRuleForGroupSystemwide()
    {
        $this->_testAddDuplicateRuleForGroup(null);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testUpdateRuleForGroup()
    {
        $this->_testUpdateRuleForGroup($this->_eventId);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testUpdateRuleForGroupSystemwide()
    {
        $this->_testUpdateRuleForGroup(null);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testDeleteRuleForPerson()
    {
        $this->_testDeleteRuleForPerson($this->_eventId);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testDeleteRuleForPersonSystemwide()
    {
        $this->_testDeleteRuleForPerson(null);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testDeleteRuleForGroup()
    {
        $this->_testDeleteRuleForGroup($this->_eventId);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testDeleteRuleForGroupSystemwide()
    {
        $this->_testDeleteRuleForGroup(null);
    }

    /**
     * @param $eventId
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    protected function _testAddRuleForPerson($eventId)
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $ruleId = $model->addRuleForPerson(
            'test_rule',
            'ololo',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $eventId
        );
        $this->assertNotNull($ruleId);
        $this->assertEquals('ololo', $model->getPersonAccess(
            $this->_person->getId(),
            $eventId
        )['test_rule']);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     * @expectedException \Frey\DuplicateEntityException
     */
    protected function _testAddDuplicateRuleForPerson($eventId)
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $model->addRuleForPerson(
            'test_rule',
            'ololo',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $eventId
        );
        $model->addRuleForPerson(
            'test_rule',
            'ololo',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $eventId
        );
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    protected function _testUpdateRuleForPerson($eventId)
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $ruleId = $model->addRuleForPerson(
            'test_rule',
            'ololo',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $eventId
        );

        $success = $model->updateRuleForPerson(
            $ruleId,
            'trololo',
            AccessPrimitive::TYPE_ENUM
        );
        $this->assertTrue($success);

        $this->assertEquals('trololo', $model->getPersonAccess(
            $this->_person->getId(),
            $eventId
        )['test_rule']);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    protected function _testAddRuleForGroup($eventId)
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $ruleId = $model->addRuleForGroup(
            'test_rule',
            'ololo',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $eventId
        );
        $this->assertNotNull($ruleId);
        $this->assertEquals('ololo', $model->getGroupAccess(
            $this->_group->getId(),
            $eventId
        )['test_rule']);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     * @expectedException \Frey\DuplicateEntityException
     */
    protected function _testAddDuplicateRuleForGroup($eventId)
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $model->addRuleForGroup(
            'test_rule',
            'ololo',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $eventId
        );
        $model->addRuleForGroup(
            'test_rule',
            'ololo',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $eventId
        );
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    protected function _testUpdateRuleForGroup($eventId)
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $ruleId = $model->addRuleForGroup(
            'test_rule',
            'ololo',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $eventId
        );

        $success = $model->updateRuleForGroup(
            $ruleId,
            'trololo',
            AccessPrimitive::TYPE_ENUM
        );
        $this->assertTrue($success);

        $this->assertEquals('trololo', $model->getGroupAccess(
            $this->_group->getId(),
            $eventId
        )['test_rule']);
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    protected function _testDeleteRuleForPerson($eventId)
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $ruleId = $model->addRuleForPerson(
            'test_rule',
            'ololo',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $eventId
        );

        $model->deleteRuleForPerson($ruleId);

        $this->assertEmpty($model->getPersonAccess(
            $this->_person->getId(),
            $eventId
        ));
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    protected function _testDeleteRuleForGroup($eventId)
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $ruleId = $model->addRuleForGroup(
            'test_rule',
            'ololo',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $eventId
        );

        $model->deleteRuleForGroup($ruleId);

        $this->assertEmpty($model->getGroupAccess(
            $this->_group->getId(),
            $eventId
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
            'test_rule1',
            'ololo1',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForPerson(
            'test_rule3',
            'ololo3',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule2',
            'ololo2',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule4',
            'ololo4',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $this->_eventId
        );
        $rules = $model->getAccessRules(
            $this->_person->getId(),
            $this->_eventId
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
    public function testGetAccessRulesPersonSystemwideUnion()
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $model->addRuleForPerson(
            'test_rule1',
            'ololo1',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForPerson(
            'test_rule3',
            'ololo3',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForPerson(
            'test_rule2',
            'ololo2',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            null
        );
        $model->addRuleForPerson(
            'test_rule4',
            'ololo4',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            null
        );
        $rules = $model->getAccessRules(
            $this->_person->getId(),
            $this->_eventId
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
    public function testGetAccessRulesGroupSystemwideUnion()
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $model->addRuleForGroup(
            'test_rule1',
            'ololo1',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule3',
            'ololo3',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule2',
            'ololo2',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            null
        );
        $model->addRuleForGroup(
            'test_rule4',
            'ololo4',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            null
        );
        $rules = $model->getAccessRules(
            $this->_person->getId(),
            $this->_eventId
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
            'test_rule_collide',
            'ololo_person',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForPerson(
            'test_rule1',
            'ololo1',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule2',
            'ololo2',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule_collide',
            'ololo_group',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $this->_eventId
        );
        $rules = $model->getAccessRules(
            $this->_person->getId(),
            $this->_eventId
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
    public function testGetAccessRulesPersonSystemwideCollide()
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $model->addRuleForPerson(
            'test_rule_collide',
            'ololo_event',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForPerson(
            'test_rule1',
            'ololo1',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForPerson(
            'test_rule2',
            'ololo2',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            null
        );
        $model->addRuleForPerson(
            'test_rule_collide',
            'ololo_systemwide',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            null
        );
        $rules = $model->getAccessRules(
            $this->_person->getId(),
            $this->_eventId
        );
        $this->assertEquals('ololo1', $rules['test_rule1']);
        $this->assertEquals('ololo2', $rules['test_rule2']);
        $this->assertEquals('ololo_event', $rules['test_rule_collide']); // event overrides systemwide
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testGetAccessRulesGroupSystemwideCollide()
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $model->addRuleForGroup(
            'test_rule_collide',
            'ololo_event',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule1',
            'ololo1',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule2',
            'ololo2',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            null
        );
        $model->addRuleForGroup(
            'test_rule_collide',
            'ololo_systemwide',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            null
        );
        $rules = $model->getAccessRules(
            $this->_person->getId(),
            $this->_eventId
        );
        $this->assertEquals('ololo1', $rules['test_rule1']);
        $this->assertEquals('ololo2', $rules['test_rule2']);
        $this->assertEquals('ololo_event', $rules['test_rule_collide']); // event overrides systemwide
    }

    /**
     * @throws DuplicateEntityException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testGetAccessRulesPersonAndGroupSystemwideCollide()
    {
        $model = new AccessManagementModel($this->_db, $this->_config, $this->_meta);
        $model->addRuleForPerson(
            'test_rule_collide',
            'ololo_event_person',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForPerson(
            'test_rule1',
            'ololo1',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForPerson(
            'test_rule2',
            'ololo2',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            null
        );
        $model->addRuleForPerson(
            'test_rule_collide',
            'ololo_systemwide1',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            null
        );
        $model->addRuleForGroup(
            'test_rule_collide',
            'ololo_event',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule3',
            'ololo3',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule4',
            'ololo4',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            null
        );
        $model->addRuleForGroup(
            'test_rule_collide',
            'ololo_systemwide2',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            null
        );
        $rules = $model->getAccessRules(
            $this->_person->getId(),
            $this->_eventId
        );
        $this->assertEquals('ololo1', $rules['test_rule1']);
        $this->assertEquals('ololo2', $rules['test_rule2']);
        $this->assertEquals('ololo3', $rules['test_rule3']);
        $this->assertEquals('ololo4', $rules['test_rule4']);
        $this->assertEquals('ololo_event_person', $rules['test_rule_collide']); // event overrides systemwide
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
            'test_rule_collide',
            'ololo_person',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForPerson(
            'test_rule1',
            'ololo1',
            AccessPrimitive::TYPE_ENUM,
            $this->_person->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule2',
            'ololo2',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $this->_eventId
        );
        $model->addRuleForGroup(
            'test_rule_collide',
            'ololo_group',
            AccessPrimitive::TYPE_ENUM,
            $this->_group->getId(),
            $this->_eventId
        );
        $this->assertEquals('ololo1', $model->getRuleValue(
            $this->_person->getId(),
            $this->_eventId,
            'test_rule1'
        ));
        $this->assertEquals('ololo2', $model->getRuleValue(
            $this->_person->getId(),
            $this->_eventId,
            'test_rule2'
        ));
        $this->assertEquals('ololo_person', $model->getRuleValue(
            $this->_person->getId(),
            $this->_eventId,
            'test_rule_collide'
        )); // person overrides group
    }
}
