<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class RoundEndDate extends AbstractMigration
{

    public function up()
    {
        $table = $this->table('round');
        $table
            ->addColumn('end_date', 'datetime', ['null' => true])
            ->save();
    }
}
