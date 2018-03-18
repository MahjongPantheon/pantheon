<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class InitVersion1m0 extends AbstractMigration
{
    public function up()
    {
        $this->_genRegistrants();
        $this->_genPerson();
//        $this->_genFormation();
//        $this->_genFormationUser();
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
            ->addColumn('email', 'string', ['limit' => 255])
            ->addColumn('auth_hash', 'string', ['limit' => 255])
            ->addColumn('auth_reset_token', 'string', ['limit' => 255, 'null' => true,
                'comment' => 'This field stores temporary secure token if user requests changing his password'])
            ->addColumn('auth_salt', 'string', ['limit' => 255,
                'comment' => 'App-level salt to make client-side permanent token'])
            ->addColumn('title', 'string', ['limit' => 255])
            ->addColumn('city', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('tenhou_id', 'string', ['limit' => 255, 'null' => true])

            ->addIndex('email', ['name' => 'person_email'])
            ->addIndex('title', ['name' => 'person_title'])
            ->addIndex('tenhou_id', ['name' => 'person_tenhouid'])

            ->save();
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
