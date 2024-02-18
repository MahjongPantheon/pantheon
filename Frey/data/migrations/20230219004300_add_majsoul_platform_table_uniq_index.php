<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

require_once __DIR__ . '/../../src/helpers/BootstrapAccess.php';

class AddMajsoulPlatformTableUniqIndex extends AbstractMigration
{
    public function up()
    {
        $this->table('majsoul_platform_accounts')
            ->addIndex('account_id', ['unique' => true])
            ->save();
    }
}
