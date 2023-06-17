<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class InitHugin extends AbstractMigration
{
    public function up()
    {
        $this->_genEvent();
        $this->_genAggregateDay();
        $this->_genAggregateMonth();
    }

    protected function _genEvent()
    {
        $table = $this->table('event');
        $table
            ->addColumn('site_id', 'string', ['limit' => 255])
            ->addColumn('session_id', 'string', ['limit' => 255])
            ->addColumn('country', 'string', ['limit' => 255])
            ->addColumn('city', 'string', ['limit' => 255])
            ->addColumn('hostname', 'string', ['limit' => 255])
            ->addColumn('os', 'string', ['limit' => 255])
            ->addColumn('device', 'string', ['limit' => 255])
            ->addColumn('screen', 'string', ['limit' => 255])
            ->addColumn('language', 'string', ['limit' => 255])
            ->addColumn('created_at', 'datetime')
            ->addColumn('event_id', 'int')
            ->addColumn('event_type', 'string', ['limit' => 255])
            ->addColumn('event_meta', 'string', ['limit' => 255])
            ->addIndex('created_at')
            ->addIndex('session_id')
            ->addIndex('event_id')
            ->save();
    }

    protected function _genAggregateDay()
    {
        $table = $this->table('aggregate_day');
        $table
            ->addColumn('day', 'datetime')
            ->addColumn('event_count', 'int')
            ->addColumn('uniq_count', 'int')
            ->addColumn('site_id', 'string', ['limit' => 255])
            ->addColumn('countries', 'text')
            ->addColumn('cities', 'text')
            ->addColumn('os', 'text')
            ->addColumn('devices', 'text')
            ->addColumn('screens', 'text')
            ->addColumn('languages', 'text')
            ->addColumn('event_type', 'string', ['limit' => 255])
            ->addColumn('event_meta', 'string', ['limit' => 255])
            ->addIndex('day')
            ->save();
    }

    protected function _genAggregateMonth()
    {
        $table = $this->table('aggregate_month');
        $table
            ->addColumn('month', 'date')
            ->addColumn('event_count', 'int')
            ->addColumn('uniq_count', 'int')
            ->addColumn('site_id', 'string', ['limit' => 255])
            ->addColumn('countries', 'text')
            ->addColumn('cities', 'text')
            ->addColumn('os', 'text')
            ->addColumn('devices', 'text')
            ->addColumn('screens', 'text')
            ->addColumn('languages', 'text')
            ->addColumn('event_type', 'string', ['limit' => 255])
            ->addColumn('event_meta', 'string', ['limit' => 255])
            ->addIndex('month')
            ->save();
    }
}
