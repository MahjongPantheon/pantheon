<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class FixMonthly extends AbstractMigration
{
    public function up()
    {
        $this->table('aggregate_day')
            ->changeColumn('event_type', 'text', ['null' => true])
            ->save();
        $this->table('aggregate_month')
            ->changeColumn('event_type', 'text', ['null' => true])
            ->save();
    }
}
