<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

require_once __DIR__ . '/../../src/helpers/BootstrapAccess.php';

class AddPersonNotificationsSettings extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('person');
        $table
            ->addColumn('notifications', 'string', ['after' => 'telegram_id', 'default' => ''])
            ->save();
        $this->getAdapter()->commitTransaction();
    }
}
