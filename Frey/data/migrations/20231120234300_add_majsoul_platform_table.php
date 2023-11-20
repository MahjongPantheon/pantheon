<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

require_once __DIR__ . '/../../src/helpers/BootstrapAccess.php';

class AddMajsoulPlatformTable extends AbstractMigration
{
    public function up()
    {
        $this->_genMajsoulAccounts();
    }

    protected function _genMajsoulAccounts()
    {
        $table = $this->table('majsoul_platform_accounts', ['id' => false, 'primary_key' => ['account_id', 'nickname']]);
        $table
            ->addColumn('id', 'biginteger', ['identity' => true])
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
