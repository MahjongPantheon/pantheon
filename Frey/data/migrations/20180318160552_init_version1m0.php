<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class InitVersion1m0 extends AbstractMigration
{
    public function up()
    {
        $this->_genUser();
        $this->_genFormation();
        $this->_genFormationUser();
    }

    /**
     * Players, orgs, etc
     */
    protected function _genUser()
    {
        $table = $this->table('user');
        $table
            ->addColumn('ident', 'string', ['limit' => 255,
                'comment' => 'oauth ident info, for example'])
            ->addColumn('alias', 'string', ['limit' => 255, 'null' => true,
                'comment' => 'user alias for text-mode game log'])
            ->addColumn('display_name', 'string', ['limit' => 255])
            ->addColumn('city', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('tenhou_id', 'string', ['limit' => 255, 'null' => true])

            ->addIndex('alias', ['name' => 'user_alias'])
            ->addIndex('ident', ['name' => 'user_ident', 'unique' => true])
            ->addIndex('tenhou_id', ['name' => 'user_tenhou'])

            ->save();
    }

    /**
     * Local clubs, leagues, etc
     */
    protected function _genFormation()
    {
        $table = $this->table('formation');
        $table
            ->addColumn('title', 'string', ['limit' => 255])
            ->addColumn('city', 'string', ['limit' => 255])
            ->addColumn('description', 'text')
            ->addColumn('logo', 'text', ['null' => true])
            ->addColumn('contact_info', 'text')
            ->addColumn('primary_owner', 'integer')

            ->addForeignKey('primary_owner', 'user')

            ->save();
    }

    /**
     * Many-to-many relation, primarily for administrative needs.
     * By default user is a player in formation.
     * User may have more than one role in formation, so no unique index is created.
     */
    protected function _genFormationUser()
    {
        $table = $this->table('formation_user');
        $table
            ->addColumn('formation_id', 'integer')
            ->addColumn('user_id', 'integer')
            ->addColumn('role', 'string', ['limit' => 255,
                'comment' => 'who is this user in this group?'])

            ->addForeignKey('formation_id', 'formation')
            ->addForeignKey('user_id', 'user')

            ->save();
    }
}
