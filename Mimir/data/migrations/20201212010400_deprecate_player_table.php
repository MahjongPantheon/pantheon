<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class DeprecatePlayerTable extends AbstractMigration
{
    public function up()
    {
        $this->table('player')
            ->rename('__deprecated_player')
            ->update();
    }
}
