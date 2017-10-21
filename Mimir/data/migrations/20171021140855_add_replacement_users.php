<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class AddReplacementUsers extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('player');
        $table
            ->addColumn('is_replacement', 'integer', array('default' => 0))
            ->save();
    }
}
