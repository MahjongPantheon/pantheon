<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

require_once __DIR__ . '/../../src/helpers/BootstrapAccess.php';

class AddCountryFieldVersion1m0 extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('person');
        $table
            ->addColumn('country', 'string', ['after' => 'phone', 'default' => 'RU'])
            ->addIndex('country')
            ->save();
        $this->getAdapter()->commitTransaction();
    }
}
