<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

require_once __DIR__ . '/../../src/helpers/BootstrapAccess.php';

class InitFreyVersion1m0 extends AbstractMigration
{
    public function up()
    {
        $this->_genRegistrants();
        $this->_genPerson();
        $this->_genPersonAccess();
        $this->_genGroup();
        $this->_genGroupAccess();
        $this->_genPersonGroup();
//        $this->_genFormation();
//        $this->_genFormationUser();


        // Should not do this here. Separate script should be used.
//        $this->getAdapter()->commitTransaction();
//
//        list($db, $config) = $this->_getConnection();
//        $meta = new \Frey\Meta($_SERVER);
//        try {
//            \Frey\BootstrapAccess::create(
//                $db, $config, $meta,
//                'admin@pantheon.mahjong', 'changethis'
//            );
//        } catch (\Exception $e) {
//            echo 'Failed to bootstrap superadmin & supergroup: ' . $e->getMessage();
//        }
    }

    /**
     * Persons trying to register
     */
    protected function _genRegistrants()
    {
        $table = $this->table('registrant');
        $table
            ->addColumn('email', 'string', ['limit' => 255])
            ->addColumn('auth_hash', 'string', ['limit' => 255])
            ->addColumn('auth_salt', 'string', ['limit' => 255,
                'comment' => 'App-level salt to make client-side permanent token'])
            ->addColumn('approval_code', 'string', ['limit' => 255])

            ->addIndex('email', ['name' => 'registrant_email'])
            ->addIndex('approval_code', ['name' => 'registrant_approval_code'])

            ->save();
    }

    /**
     * Persons known to system
     */
    protected function _genPerson()
    {
        $table = $this->table('person');
        $table
            ->addColumn('email', 'string', ['limit' => 255,
                'comment' => 'PERSONAL DATA'])
            ->addColumn('auth_hash', 'string', ['limit' => 255])
            ->addColumn('auth_reset_token', 'string', ['limit' => 255, 'null' => true,
                'comment' => 'This field stores temporary secure token if user requests changing his password'])
            ->addColumn('auth_salt', 'string', ['limit' => 255,
                'comment' => 'App-level salt to make client-side permanent token'])
            ->addColumn('title', 'string', ['limit' => 255])
            ->addColumn('phone', 'string', ['limit' => 255, 'null' => true,
                'comment' => 'PERSONAL DATA'])
            ->addColumn('city', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('tenhou_id', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('disabled', 'integer')

            ->addIndex('email', ['name' => 'person_email'])
            ->addIndex('phone', ['name' => 'person_phone'])
            ->addIndex('title', ['name' => 'person_title'])
            ->addIndex('tenhou_id', ['name' => 'person_tenhouid'])
            ->addIndex('disabled', ['name' => 'person_disabled'])

            ->save();
    }

    /**
     * Per-user ACL rules
     */
    protected function _genPersonAccess()
    {
        $table = $this->table('person_access');
        $table
            ->addColumn('person_id', 'integer')
            ->addColumn('event_ids', 'string', ['limit' => 255,
                'comment' => 'Comma-separated list of event IDs. Index is explicitly omitted, because one should not search by this field anyway'])
            ->addColumn('acl_type', 'string', ['limit' => 32,
                'comment' => 'Data type stored in this cell. Can be boolean, enum or integer'])
            ->addColumn('acl_name', 'string', ['limit' => 255,
                'comment' => 'ACL item recognizable name to differentiate this one from others'])
            ->addColumn('acl_value', 'string', ['limit' => 255,
                'comment' => 'ACL value. Has limit of 255 bytes long for performance reasons'])

            ->addIndex('acl_name', ['name' => 'access_acl_name_person'])
            ->addIndex('acl_value', ['name' => 'access_acl_value_person'])
            ->addForeignKey('person_id', 'person')

            ->save();
    }

    /**
     * Per-group ACL rules
     */
    protected function _genGroupAccess()
    {
        $table = $this->table('group_access');
        $table
            ->addColumn('group_id', 'integer')
            ->addColumn('event_ids', 'string', ['limit' => 255,
                'comment' => 'Comma-separated list of event IDs. Index is explicitly omitted, because one should not search by this field anyway'])
            ->addColumn('acl_type', 'string', ['limit' => 32,
                'comment' => 'Data type stored in this cell. Can be boolean, enum or integer'])
            ->addColumn('acl_name', 'string', ['limit' => 255,
                'comment' => 'ACL item recognizable name to differentiate this one from others'])
            ->addColumn('acl_value', 'string', ['limit' => 255,
                'comment' => 'ACL value. Has limit of 255 bytes long for performance reasons'])

            ->addIndex('acl_value', ['name' => 'access_acl_value_group'])
            ->addForeignKey('group_id', 'group')

            ->save();
    }

    /**
     * Group of users
     */
    protected function _genGroup()
    {
        $table = $this->table('group');
        $table
            ->addColumn('title', 'string', ['limit' => 255])
            ->addColumn('label_color', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('description', 'text')

            ->save();
    }

    /**
     * Person <-> group many-to-many relation
     */
    protected function _genPersonGroup()
    {
        $table = $this->table('person_group');
        $table
            ->addColumn('person_id', 'integer')
            ->addColumn('group_id', 'integer')
            ->addColumn('order', 'integer')

            ->addIndex(['person_id', 'group_id'], ['name' => 'person_group_uniq', 'unique' => true])

            ->addForeignKey('person_id', 'person')
            ->addForeignKey('group_id', 'group')

            ->save();
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
            'routes'    => require __DIR__ . '/../../config/routes.php',
            'verbose'   => false,
            'verboseLog' => '',
            'api' => [
                'version_major' => 1,
                'version_minor' => 0
            ],
            'testing_token' => 'not_used_here'
        ]);

        return [new \Frey\Db($cfg), $cfg];
    }

//    /**
//     * Local clubs, leagues, etc
//     */
//    protected function _genFormation()
//    {
//        $table = $this->table('formation');
//        $table
//            ->addColumn('title', 'string', ['limit' => 255])
//            ->addColumn('city', 'string', ['limit' => 255])
//            ->addColumn('description', 'text')
//            ->addColumn('logo', 'text', ['null' => true])
//            ->addColumn('contact_info', 'text')
//            ->addColumn('primary_owner', 'integer')
//
//            ->addForeignKey('primary_owner', 'user')
//
//            ->save();
//    }
//
//    /**
//     * Many-to-many relation, primarily for administrative needs.
//     * By default user is a player in formation.
//     * User may have more than one role in formation, so no unique index is created.
//     */
//    protected function _genFormationUser()
//    {
//        $table = $this->table('formation_user');
//        $table
//            ->addColumn('formation_id', 'integer')
//            ->addColumn('user_id', 'integer')
//            ->addColumn('role', 'string', ['limit' => 255,
//                'comment' => 'who is this user in this group?'])
//
//            ->addForeignKey('formation_id', 'formation')
//            ->addForeignKey('user_id', 'user')
//
//            ->save();
//    }
}
