<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

require_once __DIR__ . '/../../src/helpers/BootstrapAccess.php';

class AddRegistrantTitle extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('registrant');
        $table
            ->addColumn('title', 'string', ['after' => 'email', 'default' => ''])
            ->save();
        $this->getAdapter()->commitTransaction();
    }
}
