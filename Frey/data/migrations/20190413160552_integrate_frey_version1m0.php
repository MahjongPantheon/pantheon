<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

require_once __DIR__ . '/../../src/helpers/BootstrapAccess.php';

class IntegrateFreyVersion1m0 extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('person_access');
        $table
            ->removeColumn('event_ids')
            ->addColumn('allowed_values', 'string')
            ->addColumn('event_id', 'integer', ['null' => true])
            ->addIndex('event_id', ['name' => 'access_event_id_person'])
            ->save();

        $table = $this->table('group_access');
        $table
            ->removeColumn('event_ids')
            ->addColumn('allowed_values', 'string')
            ->addColumn('event_id', 'integer', ['null' => true])
            ->addIndex('event_id', ['name' => 'access_event_id_group'])
            ->save();

        $this->getAdapter()->commitTransaction();
    }
}
