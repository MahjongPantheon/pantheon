<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

require_once __DIR__ . '/../../src/helpers/BootstrapAccess.php';

class AddSuperadminFieldVersion1m0 extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('person');
        $table
            ->addColumn('is_superadmin', 'integer', ['default' => 0])
            ->save();
        $this->getAdapter()->commitTransaction();
    }
}
