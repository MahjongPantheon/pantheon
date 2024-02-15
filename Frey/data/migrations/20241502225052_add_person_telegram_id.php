<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

require_once __DIR__ . '/../../src/helpers/BootstrapAccess.php';

class AddPersonTelegramId extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('person');
        $table
            ->addColumn('telegram_id', 'string', ['after' => 'email', 'default' => ''])
            ->save();
        $this->getAdapter()->commitTransaction();
    }
}
