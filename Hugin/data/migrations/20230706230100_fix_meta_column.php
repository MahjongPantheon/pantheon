<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class FixMetaColumn extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('event', ['id' => false, 'primary_key' => 'id']);
        $table
            ->changeColumn('event_meta', 'text', ['null' => true])
            ->save();
    }
}
