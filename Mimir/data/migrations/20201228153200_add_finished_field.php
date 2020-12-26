<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class AddFinishedField extends AbstractMigration
{
    public function up()
    {
        $this->table('event')
            ->addColumn('finished', 'integer', ['default' => 0])
            ->addIndex('finished')
            ->save();
    }
}
