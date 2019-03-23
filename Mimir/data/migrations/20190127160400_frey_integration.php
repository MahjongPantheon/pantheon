<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class FreyIntegration extends AbstractMigration
{
    public function up()
    {
        // ========= New columns in event ==========

        $table = $this->table('event');
        $table
            ->renameColumn('owner_formation', '__deprecated_owner_formation')
            ->renameColumn('owner_player', '__deprecated_owner_player')
            ->changeColumn('type', 'string', ['null' => true])
            ->renameColumn('type', '__deprecated_type')
            ->update();

        $this->table('formation')
            ->rename('__deprecated_formation')
            ->update();

        $this->table('formation_player')
            ->rename('__deprecated_formation_player')
            ->update();
    }
}
