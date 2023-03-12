<?php

use Phinx\Seed\AbstractSeed;
require_once __DIR__ . '/../../src/primitives/Group.php';
require_once __DIR__ . '/../../src/primitives/Person.php';
require_once __DIR__ . '/../../src/primitives/PersonAccess.php';
require_once __DIR__ . '/../../src/primitives/GroupAccess.php';
require_once __DIR__ . '/../../src/primitives/Registrant.php';
require_once __DIR__ . '/../../src/models/Auth.php';
require_once __DIR__ . '/../../src/models/Account.php';
require_once __DIR__ . '/../../src/models/Groups.php';
require_once __DIR__ . '/../../src/models/AccessManagement.php';
require_once __DIR__ . '/../../src/helpers/Db.php';
require_once __DIR__ . '/../../src/helpers/Meta.php';
require_once __DIR__ . '/../../src/helpers/BootstrapAccess.php';

class BasicSeeder extends AbstractSeed
{
    const EVENT_ID = 1; // TODO: this should be taken from seed of mimir

    /**
     * @throws Exception
     * @throws \Frey\InvalidParametersException
     */
    public function run()
    {
        // Non-phinx-based seeder to avoid rewriting seeds for every schema change

        $tables = file(__DIR__ . '/../tablelist.txt');

        // cleanup. Don't use truncate() - it won't work with FKs
        foreach ($tables as $t) {
            if (trim($t) === 'phinxlog') {
                continue;
            }
            $this->table($t)->getAdapter()->execute('DELETE FROM "' . trim($t) . '"');
        }

        $this->table('player')->getAdapter()->commitTransaction();

        list($db, $config) = $this->_getConnection();
        $meta = new \Frey\Meta(new \Common\Storage('localhost'), $_SERVER);

        list($adminId, $adminGroupId) = \Frey\BootstrapAccess::create($db, $config, $meta, 'admin@localhost.localdomain', '123456');

        $groupIds = $this->_seedGroups($db, $config, $meta, $adminGroupId);
        $personIds = $this->_seedPersons($db, $config, $meta, $groupIds, $adminId);
        $this->_seedGroupAccess($db, $config, $groupIds);
        $this->_seedPersonAccess($db, $config, $personIds);
    }

    /**
     * @param \Frey\Db $db
     * @param \Frey\Config $config
     * @param \Frey\Meta $meta
     * @param $adminGroupId
     * @return array
     * @throws Exception
     * @throws \Frey\InvalidParametersException
     */
    protected function _seedGroups(\Frey\Db $db, \Frey\Config $config, \Frey\Meta $meta, $adminGroupId)
    {
        $model = new \Frey\GroupsModel($db, $config, $meta);
        $trnId = $model->createGroup('Club leaders', 'Local club leaders', '00ff00');
        $plrId = $model->createGroup('Players', 'Usual players', '0000ff');
        return [
            'admins' => $adminGroupId,
            'leaders' => $trnId,
            'players' => $plrId
        ];
    }

    /**
     * @param \Frey\Db $db
     * @param \Frey\Config $config
     * @param \Frey\Meta $meta
     * @param $groupIds
     * @param $superAdminId
     * @return array
     * @throws Exception
     * @throws \Frey\EntityNotFoundException
     * @throws \Frey\InvalidParametersException
     */
    protected function _seedPersons(\Frey\Db $db, \Frey\Config $config, \Frey\Meta $meta, $groupIds, $superAdminId)
    {
        $model = new \Frey\AccountModel($db, $config, $meta);
        $groupModel = new \Frey\GroupsModel($db, $config, $meta);
        $adminIds = [$superAdminId];
        $leadersIds = [];
        $playersIds = [];
        for ($i = 0; $i < 3; $i++) {
            $id = $model->createAccount(
                "admin{$i}@test.com", 'test', "Admin $i",
                'Moscow', '123-456-78-90', ''
            );
            $groupModel->addPersonToGroup($id, $groupIds['admins']);
            $adminIds[] = $id;
        }
        for ($i = 0; $i < 6; $i++) {
            $id = $model->createAccount(
                "leader{$i}@test.com", 'test', "Leader $i",
                'Moscow', '123-456-78-90', ''
            );
            $groupModel->addPersonToGroup($id, $groupIds['leaders']);
            $leadersIds[] = $id;
        }
        for ($i = 0; $i < 36; $i++) {
            $id = $model->createAccount(
                "player{$i}@test.com", 'test', "Player $i",
                'Moscow', '123-456-78-90', ''
            );
            $groupModel->addPersonToGroup($id, $groupIds['players']);
            $playersIds[] = $id;
        }
        return [
            'admins' => $adminIds,
            'leaders' => $leadersIds,
            'players' => $playersIds
        ];
    }

    /**
     * @param \Frey\Db $db
     * @param \Frey\Config $config
     * @param $groupIds
     * @throws Exception
     * @throws \Frey\DuplicateEntityException
     * @throws \Frey\EntityNotFoundException
     */
    protected function _seedGroupAccess(\Frey\Db $db, \Frey\Config $config, $groupIds)
    {
        $meta = new \Frey\Meta(new \Common\Storage('localhost'), $_SERVER);
        $model = new \Frey\AccessManagementModel($db, $config, $meta);

        // admins are system-wide
        $model->addSystemWideRuleForGroup(
            'canAddEvent', true, \Frey\AccessPrimitive::TYPE_BOOL,
            $groupIds['admins']
        );
        $model->addSystemWideRuleForGroup(
            'canModifyEvent', true, \Frey\AccessPrimitive::TYPE_BOOL,
            $groupIds['admins']
        );
        $model->addSystemWideRuleForGroup(
            'canRegisterPlayer', true, \Frey\AccessPrimitive::TYPE_BOOL,
            $groupIds['admins']
        );
        $model->addSystemWideRuleForGroup(
            'canAddPlayerToEvent', true, \Frey\AccessPrimitive::TYPE_BOOL,
            $groupIds['admins']
        );
        $model->addSystemWideRuleForGroup(
            'canRemovePlayerFromEvent', true, \Frey\AccessPrimitive::TYPE_BOOL,
            $groupIds['admins']
        );
        $model->addSystemWideRuleForGroup(
            'canModifyPlayer', true, \Frey\AccessPrimitive::TYPE_BOOL,
            $groupIds['admins']
        );
        $model->addSystemWideRuleForGroup(
            'canViewEvent', true, \Frey\AccessPrimitive::TYPE_BOOL,
            $groupIds['admins']
        );

        // leaders are bound to event usually
        $model->addRuleForGroup(
            'canModifyEvent', true, \Frey\AccessPrimitive::TYPE_BOOL,
            $groupIds['leaders'], self::EVENT_ID
        );
        $model->addRuleForGroup(
            'canAddPlayerToEvent', true, \Frey\AccessPrimitive::TYPE_BOOL,
            $groupIds['leaders'], self::EVENT_ID
        );
        $model->addRuleForGroup(
            'canRemovePlayerFromEvent', true, \Frey\AccessPrimitive::TYPE_BOOL,
            $groupIds['leaders'], self::EVENT_ID
        );
        $model->addSystemWideRuleForGroup(
            'canViewEvent', true, \Frey\AccessPrimitive::TYPE_BOOL,
            $groupIds['leaders']
        );

        // players have no special rights
        $model->addSystemWideRuleForGroup(
            'canViewEvent', true, \Frey\AccessPrimitive::TYPE_BOOL,
            $groupIds['players']
        );
    }

    /**
     * @param \Frey\Db $db
     * @param \Frey\Config $config
     * @param $personIds
     * @throws Exception
     * @throws \Frey\DuplicateEntityException
     * @throws \Frey\EntityNotFoundException
     */
    protected function _seedPersonAccess(\Frey\Db $db, \Frey\Config $config, $personIds)
    {
        $meta = new \Frey\Meta(new \Common\Storage('localhost'), $_SERVER);
        $model = new \Frey\AccessManagementModel($db, $config, $meta);

        // nullify some system-wide rules for last admin
        $model->addSystemWideRuleForPerson(
            'canAddEvent', false, \Frey\AccessPrimitive::TYPE_BOOL,
            end($personIds['admins'])
        );
        $model->addSystemWideRuleForPerson(
            'canAddPlayerToEvent', false, \Frey\AccessPrimitive::TYPE_BOOL,
            end($personIds['admins'])
        );

        // nullify some event-bound rules for last leader
        $model->addRuleForPerson(
            'canModifyEvent', true, \Frey\AccessPrimitive::TYPE_BOOL,
            end($personIds['leaders']), self::EVENT_ID
        );
    }

    protected function _getConnection()
    {
        $cfg = new \Frey\Config([
            'db' => [
                'connection_string' => 'pgsql:host=localhost;port=' . $_SERVER['PHINX_DB_FREY_PORT']
                    . ';dbname=' . $_SERVER['PHINX_DB_FREY_NAME'],
                'credentials' => [
                    'username' => $_SERVER['PHINX_DB_FREY_USER'],
                    'password' => $_SERVER['PHINX_DB_FREY_PASS']
                ]
            ],
            'admin'     => [
                'debug_token' => '2-839489203hf2893'
            ],
            'testing_token' => '',
            'routes'    => require __DIR__ . '/../../config/routes.php',
            'verbose'   => false,
            'verboseLog' => '',
            'api' => [
                'version_major' => 1,
                'version_minor' => 0
            ]
        ]);

        return [new \Frey\Db($cfg), $cfg];
    }
}
