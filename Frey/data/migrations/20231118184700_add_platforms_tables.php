<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

require_once __DIR__ . '/../../src/helpers/BootstrapAccess.php';

class AddPlatformsTables extends AbstractMigration
{
    public function up()
    {
        $this->_genTenhouAccounts();
        $this->_genMajsoulAccounts();
    }

    protected function _genTenhouAccounts()
    {
        $table = $this->table('tenhou_platform_accounts');
        $table
            ->addColumn('tenhou_id', 'string', ['limit' => 255, 'null' => false])
            ->addColumn('person_id', 'integer')
            ->addIndex('tenhou_id', ['name' => 'person_tenhou_platform_idx'])
            ->addForeignKey('person_id', 'person')
            ->save();
    }

    protected function _genMajsoulAccounts()
    {
        $table = $this->table('majsoul_platform_accounts', ['id' => false, 'primary_key' => ['account_id', 'nickname']]);
        $table
            ->addColumn('nickname', 'string', ['limit' => 255, 'null' => false])
            ->addColumn('person_id', 'integer')
            ->addColumn('friend_id', 'integer', ['null' => false])
            ->addColumn('account_id', 'integer', ['null' => false])
            ->addIndex('nickname', ['name' => 'person_majsoul_platform_idx'])
            ->addIndex('account_id', ['name' => 'person_account_majsoul_platform_idx'])
            ->addForeignKey('person_id', 'person')
            ->save();
    }
}
